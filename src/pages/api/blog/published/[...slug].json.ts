import { getBlog, getBlogPublished } from "@model/blog";
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
  const blog = await getBlogPublished(slug);
  if(blog.rows.length == 0){
    return new Response(JSON.stringify({status:"error", message: "Blog not found"}), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify({status:"success", data: blog.rows[0]}), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}