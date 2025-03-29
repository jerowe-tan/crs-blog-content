export async function getAllData(callback: (page:number, limit:number)=>Promise<any[]>, limitPerPage:number = 10): Promise<{
  totalPage: number,
  totalItem: number,
  data: any[],
}>{
  let totalItem = 0;
  let page = 1;
  const data: any[] = [];
  while (true) {
    const data = await callback(page, limitPerPage);
    if (data.length < limitPerPage) {
      break;
    }
    totalItem += data.length;
    data.push(...data);
    page++;
  }
  return {
    totalPage: page,
    totalItem: totalItem,
    data: data,
  }
}