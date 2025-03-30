import { getBlog, getBlogPublished } from "@model/blog";
import type { APIRoute } from "astro";
import type { DATA_DB } from "src/structure/blog";


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
  const blog = await getBlogPublished(slug);
  if(blog.rows.length == 0){
    return new Response(JSON.stringify({status:"error", message: "Blog not found"}), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const data = blog.rows[0] as unknown as DATA_DB;
  data.thumbnailSource = `${url.protocol}//${url.host}/api/blog/published/thumbnail/${data.slug}`;
  data.contentSource = `${url.protocol}//${url.host}/api/blog/published/${data.slug}`;

  return new Response(JSON.stringify({status:"success", data}), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}