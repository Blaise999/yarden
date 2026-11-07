import { unstable_cache } from "next/cache";
import { getCms } from "./cmsStore";
import { DEFAULT_CMS, type CmsData } from "../content/defaultCms";

// All public routes share the same cached, admin-invalidated snapshot.
export const getPublicCms=unstable_cache(async ():Promise<CmsData>=>{
 try{return await getCms();}catch{return DEFAULT_CMS;}
},["yarden:public-cms:v23"],{tags:["yarden:public-cms"],revalidate:30});
