import type {Metadata} from "next";
import {SITE_URL} from "../libs/seo";
import {DEFAULT_CMS} from "../content/defaultCms";
import {getPublicCms} from "../libs/publicCms";
import PageClient from "./page.client";
export const revalidate=30;
export const metadata:Metadata={alternates:{canonical:"/"}};
const structuredData={"@context":"https://schema.org","@graph":[
 {"@type":"WebSite","@id":`${SITE_URL}/#website`,name:"Yarden",alternateName:["thisisyarden","thisisyarden.com"],url:`${SITE_URL}/`,inLanguage:"en"},
 {"@type":"Person","@id":`${SITE_URL}/#artist`,name:"Yarden",url:`${SITE_URL}/`,image:`${SITE_URL}/editorial/yarden-hero-desktop.webp`,jobTitle:"Recording artist and songwriter",sameAs:["https://www.instagram.com/thisisyarden/","https://www.youtube.com/@thisisyarden","https://www.tiktok.com/@thisisyarden"]},
 {"@type":"MusicAlbum","@id":`${SITE_URL}/#angel-album`,name:"ANGEL",url:`${SITE_URL}/music`,byArtist:{"@id":`${SITE_URL}/#artist`},image:`${SITE_URL}/Pictures/angel.jpg`,datePublished:"2026-10-30",numTracks:13}
]};
export default async function Page(){
 const cms=await getPublicCms();
 const releases=(cms.releases??DEFAULT_CMS.releases).filter(r=>r?.enabled!==false);
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\\u003c")}}/><PageClient releases={releases}/></>;
}
