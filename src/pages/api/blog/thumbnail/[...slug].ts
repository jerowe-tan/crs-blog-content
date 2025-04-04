import { getBlog } from "@model/blog";
import { getFile } from "@utils/fileUpload";
import type { APIRoute } from "astro";


export const GET:APIRoute = async ({cookies, url, params})=>{
  let { slug } = params;
  // Check if the slug is valid
  if(slug == undefined || slug == ""){
    return new Response(JSON.stringify({status:"error", message: "Invalid slug"}), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Fetch the blog post from the database
  const blog = await getBlog(slug);
  if(blog.rows.length == 0){
    return new Response(JSON.stringify({status:"error", message: "Blog not found"}), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Prepare file location
  const thumbnailContent = await getFile((blog.rows[0] as any).thumbnail);

  if(thumbnailContent == null || thumbnailContent.file == null){
    return new Response(JSON.stringify({status:"error", message: "Thumbnail file not found"}), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(thumbnailContent.file, {
    status: 200,
    headers: {
      "Content-Type": thumbnailContent.mimeType,
    },
  });
  
}