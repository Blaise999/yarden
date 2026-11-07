import type {Metadata} from "next";
import {ArrowUpRight,Play} from "lucide-react";
import SilverSiteShell from "../../components/landing/SilverSiteShell";
import SilverMasthead from "../../components/landing/SilverMasthead";
import {getPublicCms} from "../../libs/publicCms";
import {DEFAULT_CMS} from "../../content/defaultCms";
export const revalidate=30;
export const metadata:Metadata={title:"Films",description:"Watch Yarden's music videos and visual stories.",alternates:{canonical:"/films"}};
function allowed(u:string){try{const x=new URL(u);return x.protocol==="https:"&&(x.hostname==="youtube.com"||x.hostname==="www.youtube.com"||x.hostname==="youtu.be"||x.hostname==="www.youtube-nocookie.com")}catch{return false}}
export default async function FilmsPage(){const cms=await getPublicCms();const items=(cms.visuals??DEFAULT_CMS.visuals).filter(v=>v?.enabled!==false&&allowed(v.href));
return <SilverSiteShell><SilverMasthead kicker="THE VISUALS / YARDEN" title="The films." description="Moving pictures from the world of Yarden."/><section className="v23-subsection"><div className="v23-subsection-top"><span>SELECTED FILMS</span><a href="https://www.youtube.com/@thisisyarden/videos" target="_blank" rel="noopener noreferrer">Yarden on YouTube <ArrowUpRight size={17}/></a></div><div className="v23-film-list">{items.length?items.map((v,i)=><a href={v.href} key={v.href} target="_blank" rel="noopener noreferrer"><span>{String(i+1).padStart(2,"0")}</span><Play size={19}/><strong>{v.title}</strong><small>{v.year||"YARDEN"}</small><ArrowUpRight size={20}/></a>):<p>New films coming soon. Visit the official YouTube channel for the latest releases.</p>}</div></section></SilverSiteShell>}
