import { HttpNativePlate, Resolve } from "@jsarmyknife/native--http";

const aiApiUrl = import.meta.env.PUBLIC_API_AI_URL;
const extendBase = "/api/v1";

function aiApi(){
	return new HttpNativePlate(aiApiUrl+extendBase, {
    "Access-Control-Request-Headers":"Authorization, Content-Type",
		"Access-Control-Request-Method":"GET, POST, PUT, PATCH, DELETE, get, post, put, patch, delete",
    "Content-Type": "application/json"
  });
}


/*|---------------------------------------------------------------------------------------|*/
/*|  AI Suggestion                                                                        |*/
/*|---------------------------------------------------------------------------------------|*/
export function ApiSuggestBlogTitle(text:string){
	const request = aiApi().path(`/suggest-blog-title`).data(JSON.stringify({
    "prompt": text,
  })).post();
	return new Resolve(request.request());
}

export function ApiSuggestBlogDescription(text:string){
  const request = aiApi().path(`/suggest-description`).data(JSON.stringify({
    "prompt": text,
  })).post();
  return new Resolve(request.request());
}

export function ApiSuggestBlogTags(text:string){
  const request = aiApi().path(`/suggest-tags`).data(JSON.stringify({
    "prompt": text,
  })).post();
  return new Resolve(request.request());
}

export function ApiSuggestBlogContent(text:string){
  const request = aiApi().path(`/suggest-content`).data(JSON.stringify({
    "prompt": text,
  })).post();
  return new Resolve(request.request());
}