import type {Metadata} from "next";
import {ArrowUpRight} from "lucide-react";
import SilverSiteShell from "../../components/landing/SilverSiteShell";
import SilverMasthead from "../../components/landing/SilverMasthead";
import {getPublicCms} from "../../libs/publicCms";
import {DEFAULT_CMS} from "../../content/defaultCms";
export const revalidate=30;
export const metadata:Metadata={title:"Journal",description:"Stories, press and updates from the world of Yarden.",alternates:{canonical:"/journal"}};
export default async function JournalPage(){const cms=await getPublicCms();const items=cms.newsletter?.pressItems??DEFAULT_CMS.newsletter.pressItems;
return <SilverSiteShell><SilverMasthead kicker="THE STORIES / YARDEN" title="The journal." description="A few words from the world outside the music."/><section className="v23-subsection"><div className="v23-subsection-top"><span>IN PRINT / IN CONVERSATION</span><span>THE ANGEL ERA</span></div><div className="v23-journal-list">{items.length?items.map((p,i)=><a key={p.id||i} href={p.href} target="_blank" rel="noopener noreferrer"><small>{p.outlet} · {p.date}</small><strong>{p.title}</strong><ArrowUpRight size={20}/></a>):<p>New stories coming soon.</p>}</div></section></SilverSiteShell>}
