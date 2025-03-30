import { getBlogsPublished } from "@model/blog";
import type { APIRoute } from "astro";


export const GET:APIRoute = async ({cookies, url, params})=>{
  let page = Number(url.searchParams.get("page") || 1);
  let limit = Number(url.searchParams.get("limit") || 10);
  page = isNaN(page) ? 1 : page;
  limit = isNaN(limit) ? 10 : limit;
  
  
  // Fetch the blog posts from the database
  const blog = await getBlogsPublished(page, limit);
  const rowData = blog;

  for(let i = 0; i < rowData.data.length; i++){
    const thumbnailFile = `${url.protocol}//${url.host}/api/blog/published/thumbnail/${rowData.data[i].slug}`;
    const blogFile = `${url.protocol}//${url.host}/api/published/api/blog/${rowData.data[i].slug}`;
    rowData.data[i].thumbnailSource = thumbnailFile;
    rowData.data[i].contentSource = blogFile;
  }

  return new Response(JSON.stringify(rowData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}