import type {Metadata} from "next";
import SilverSiteShell from "../../components/landing/SilverSiteShell";
import SilverMasthead from "../../components/landing/SilverMasthead";
import YardenMusicGallery from "../../components/landing/YardenMusicGallery";
import {getPublicCms} from "../../libs/publicCms";
import {DEFAULT_CMS} from "../../content/defaultCms";
export const revalidate=30;
export const metadata:Metadata={title:"Music & Discography",description:"Explore ANGEL, Muse and Yarden's discography.",alternates:{canonical:"/music"}};
export default async function MusicPage(){const cms=await getPublicCms();const releases=(cms.releases??DEFAULT_CMS.releases).filter(r=>r?.enabled!==false);
return <SilverSiteShell><SilverMasthead kicker="THE SOUND / YARDEN" title="The music." description="The records, the stories, and everything in between."/><YardenMusicGallery releases={releases}/></SilverSiteShell>}
