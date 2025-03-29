import {Modal} from "@jsarmyknife/native--pop";
import { DOMPopTransformer} from "@jsarmyknife/native--dom";
import { actions } from "astro:actions";
import { navigate } from "astro:transitions/client";

export async function deletePop(slug:string){
  console.log("DELETING PROMPT"); 
  const warningPop = new Modal(DOMPopTransformer);
  warningPop.type("info").title("Delete").message("You are about to delete this blog post. Are you sure?").button("Yes", "Close", true, true).callback(async ()=>{
    const loadingPop = new Modal(DOMPopTransformer);
    loadingPop.type("loading").title("Deleting").message("Deleting blog post...").run();
    const {data, error} = await actions.blog.delete({slug});
    if(error){
      loadingPop.type("error").title("Error").message(error.message).button("Close", false, true, false).run();
      return;
    }
    loadingPop.type("success").title("Success").message("Blog post deleted successfully.").button("Check List", false, true, true).callback(()=>{
      navigate("/blog");
    }, undefined, ()=>{
      navigate("/blog");
    }, ()=>{
      navigate("/blog");
    }).run();
  }).run();
}