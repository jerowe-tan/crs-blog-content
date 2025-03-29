import { DateNavigator, padNumber } from "@jsarmyknife/native--math";
import { DB } from "./Initial";


export async function createBlog(input: {
  title: string,
  author: string,
  published: string,
  content_type: "BLOG" | "ANNOUNCEMENT" | "MAINTENANCE" | "NEWS",
  tags?: string[],
  description?: string,
  thumbnail: string,
  slug: string,
  markdown_link: string,
  status: "DRAFT" | "PUBLISHED",
}){
  const db = DB();
  return await db.execute({
    sql: `INSERT INTO blog_content (title, author, published, content_type, tags, description, thumbnail, slug, markdown_link, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *`,
    args: [
      input.title,
      input.author,
      input.published,
      input.content_type,
      input.tags ? JSON.stringify(input.tags) : "[]",
      input.description || "",
      input.thumbnail,
      input.slug,
      input.markdown_link,
      input.status,
    ],
  })
};


export async function getBlog(slug: string){
  const db = DB();
  return await db.execute({
    sql: `SELECT * FROM blog_content WHERE slug = ?`,
    args: [slug],
  })
}
export async function getBlogPublished(slug: string){
  const db = DB();
  return await db.execute({
    sql: `SELECT * FROM blog_content WHERE slug = ? AND status = 'PUBLISHED'`,
    args: [slug],
  })
}

export async function getBlogsPublished(page: number, limit: number = 10){
  const result:{
    data: any[],
    totalPage: number,
    page: number,
    limit: number,
    total: number,
  } = {
    data:[],
    totalPage: 1,
    page: page,
    limit: limit < 1 ? 1 : limit,
    total: 0,
  } 
  const db = DB();
  const raw = await db.execute({
    sql: `SELECT * FROM blog_content WHERE status = 'PUBLISHED' ORDER BY published DESC LIMIT ? OFFSET ?`,
    args: [limit, (page-1)*limit],
  });
  result.data = raw.rows as any[];

  //Get the total number of blogs
  const rawCount = await db.execute({
    sql: `SELECT COUNT(*) as total FROM blog_content WHERE status = 'PUBLISHED'`,
    args: [],
  });
  result.total = rawCount.rows[0].total as number;
  result.totalPage = Math.ceil(result.total / limit);
  return result;
}

export async function getBlogs(page: number, limit: number = 10){
  const result:{
    data: any[],
    totalPage: number,
    page: number,
    limit: number,
    total: number,
  } = {
    data:[],
    totalPage: 1,
    page: page,
    limit: limit < 1 ? 1 : limit,
    total: 0,
  } 
  const db = DB();
  const raw = await db.execute({
    sql: `SELECT * FROM blog_content ORDER BY published DESC LIMIT ? OFFSET ?`,
    args: [limit, (page-1)*limit],
  });
  result.data = raw.rows as any[];

  //Get the total number of blogs
  const rawCount = await db.execute({
    sql: `SELECT COUNT(*) as total FROM blog_content`,
    args: [],
  });
  result.total = rawCount.rows[0].total as number;
  result.totalPage = Math.ceil(result.total / limit);
  return result;
}

export async function deleteBlog(slug: string){
  const db = DB();
  //Get the blog post first
  const blog = await db.execute({
    sql: `SELECT * FROM blog_content WHERE slug = ?`,
    args: [slug],
  });
  if(blog.rows.length == 0){
    return null;
  }
  const previousData = blog.rows[0] as {[key:string]: any};
  await db.execute({
    sql: `DELETE FROM blog_content WHERE slug = ?`,
    args: [slug],
  });
  return previousData;
}


export async function updateBlog(input: {
  id: string,
  title: string,
  author: string,
  published: string,
  content_type: "BLOG" | "ANNOUNCEMENT" | "MAINTENANCE" | "NEWS",
  tags: string,
  description: string,
  thumbnail: string,
  slug: string,
  markdown_link: string,
  status: "DRAFT" | "PUBLISHED",
}){
  const db = DB();

  return await db.execute({
    sql: `UPDATE blog_content SET title = ?, author = ?, published = ?, content_type = ?, tags = ?, description = ?, thumbnail = ?, slug = ?, markdown_link = ?, status = ? WHERE id = ? RETURNING *`,
    args: [
      input.title,
      input.author,
      input.published,
      input.content_type,
      input.tags,
      input.description ,
      input.thumbnail,
      input.slug,
      input.markdown_link ,
      input.status,
      input.id,
    ],
  });
}