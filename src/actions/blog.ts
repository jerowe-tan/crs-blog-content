import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import {convertBase64ToFile} from "@jsarmyknife/native--file";
import { DateNavigator, padNumber, transformDate } from "@jsarmyknife/native--math";
import { deleteFile, getFile, setFile } from "@utils/fileUpload";
import { createBlog, deleteBlog, getBlog, updateBlog } from "@model/blog";
import type { DATA_DB } from "src/structure/blog";


export const blog = {
  create: defineAction({
    input: z.object({
      title: z.string(),
      author: z.string(),
      published: z.string(),
      contentType: z.enum(["BLOG", "ANNOUNCEMENT", "MAINTENANCE", "NEWS"]),
      status: z.enum(["DRAFT", "PUBLISHED"]),
      tags: z.array(z.string()).optional(),
      description: z.string().optional(),
      thumbnail: z.string(),
      content: z.string(),
    }),
    async handler(input, context) {
      //Transform Into Files
      const thumbnail = convertBase64ToFile(input.thumbnail, "thumbnail.png");
      const ContentMarkdown = new File([input.content], "content.md", { type: "text/markdown" });

      //Prepare Dates and Slug
      const date = new DateNavigator(input.published).setTimezone("Asia/Manila", true);
      const slug = `${date.getFullYear()}/${padNumber(date.getMonth()+1, 2)}/${(input.title.replace(/[^a-zA-Z0-9]/g, "-").split("-").filter((item) => item !== "").filter((_,i)=>i<5 ).join("-"))}`.toLowerCase();

      //Upload Files
      await setFile(`/blog/${slug}`, "text/markdown", ContentMarkdown);
      await setFile(`/thumbnail/${slug}`, thumbnail.type, thumbnail);


      //Upload to db
      const blog = await createBlog({
        title: input.title,
        author: input.author,
        published: transformDate(date, "iso-extended"),
        content_type: input.contentType,
        tags: input.tags,
        description: input.description,
        thumbnail: `/thumbnail/${slug}`,
        slug: slug,
        markdown_link: `/blog/${slug}`,
        status: input.status,
      });

      return blog.rows[0] as unknown as {
        id: number,
        title: string,
        author: string,
        published: string,
        content_type: "BLOG" | "ANNOUNCEMENT" | "MAINTENANCE" | "NEWS",
        tags: string[],
        description: string,
        thumbnail: string,
        slug: string,
        markdown_link: string,
        status: "DRAFT" | "PUBLISHED",
        created_at: string,
        updated_at: string,
      }
    },
  }),
  update: defineAction({
    input: z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string().optional(),
      author: z.string().optional(),
      published: z.string().optional(),
      contentType: z.enum(["BLOG", "ANNOUNCEMENT", "MAINTENANCE", "NEWS"]).optional(),
      status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
      tags: z.array(z.string()).optional(),
      description: z.string().optional(),
      thumbnail: z.string().optional(),
      content: z.string().optional(),
    }),
    async handler(input, context) {
      const { id, slug } = input;
      
      //Get old blog data
      const oldBlog = await getBlog(slug);

      const data = oldBlog.rows[0] as unknown as DATA_DB;

      let slugChanged = false;

      if(input.published){
        const date = new DateNavigator(input.published).setTimezone("Asia/Manila", true);
        const oldDate = new DateNavigator(data.published).setTimezone("Asia/Manila", true);
        if(date.getTime() != oldDate.getTime()){
          data.published = transformDate(date, "iso-extended");
        }
        const newSlug = `${date.getFullYear()}/${padNumber(date.getMonth()+1, 2)}/${((input.title || data.title).replace(/[^a-zA-Z0-9]/g, "-").split("-").filter((item) => item !== "").filter((_,i)=>i<5 ).join("-"))}`.toLowerCase();
        data.slug = newSlug;
        //Check if slug is unique
        const blog = await getBlog(newSlug);
        if(blog.rows.length > 0 && blog.rows[0].id != id){
          throw new ActionError({message:"Blog with that title already exists", code:"CONFLICT"});
        }
        slugChanged = true;
        data.slug = newSlug;
      }

        //Update Files too;
        //Get the old thumbnail and mardown
        const oldThumbnail = slugChanged ? await getFile(data.thumbnail) : undefined;
        const oldMarkdown = slugChanged ? await getFile(data.markdown_link) : undefined;

        //Delete old files
        if(slugChanged){
          await deleteFile(data.thumbnail);
          await deleteFile(data.markdown_link);  
        }
        
        //Re-upload with new slug key
        let newThumbnail:File|undefined = undefined;
        let newContentMarkdown:File|undefined = undefined;
        if(slugChanged && oldThumbnail != undefined && oldMarkdown != undefined){
          newThumbnail = new File([oldThumbnail.file], data.slug+"_thumbnail", { type: oldThumbnail.mimeType });
          newContentMarkdown = new File([oldMarkdown.file], data.slug+"_content.md", { type: oldMarkdown.mimeType });
        }
        if(input.thumbnail){
          newThumbnail = convertBase64ToFile(input.thumbnail, data.slug+"_thumbnail");
        }
        if(input.content){
          newContentMarkdown = new File([input.content], data.slug+"_content.md", { type: "text/markdown" });
        }
        // console.log("newThumbnail", newThumbnail);
        // console.log("newContentMarkdown", newContentMarkdown);
        if(newThumbnail){
          await setFile(`/thumbnail/${data.slug}`, newThumbnail.type, newThumbnail);
        }
        if(newContentMarkdown){
          await setFile(`/blog/${data.slug}`, "text/markdown", newContentMarkdown);
        }
        

        data.thumbnail = `/thumbnail/${data.slug}`;
        data.markdown_link = `/blog/${data.slug}`;

      //Update the rest of data
      data.title = input.title || data.title;
      data.author = input.author || data.author;
      data.content_type = input.contentType || data.content_type;
      data.tags = input.tags ? JSON.stringify(input.tags) : data.tags;
      data.description = input.description || data.description;
      data.status = input.status || data.status;
      

      //update the blog
      const result = await updateBlog(data as any);
      if(result.rows.length == 0){
        throw new ActionError({message:"Blog not found", code:"NOT_FOUND"});
      }

      return result.rows[0] as unknown as DATA_DB;
    }
  }),
  delete: defineAction({
    input: z.object({
      slug: z.string(),
    }),
    async handler(input, context) {
      const { slug } = input;
      const result = await deleteBlog(slug);
      if(result == null){
        throw new ActionError({message:"Blog not found", code:"NOT_FOUND"});
      }
      await deleteFile(result.thumbnail);
      await deleteFile(result.markdown_link);
  
      return result as DATA_DB;
    }
  })
}