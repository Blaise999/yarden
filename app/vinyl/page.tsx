import type {Metadata} from "next";
import SilverSiteShell from "../../components/landing/SilverSiteShell";
import SilverMasthead from "../../components/landing/SilverMasthead";
import AngelExtras from "../../components/landing/AngelExtras";
export const metadata:Metadata={title:"ANGEL Vinyl",description:"Request an ANGEL vinyl copy from the Yarden team.",alternates:{canonical:"/vinyl"}};
export default function VinylPage(){return <SilverSiteShell><SilverMasthead kicker="ANGEL / THE COLLECTION" title="Own the sound." description="Keep your favourite record close."/><AngelExtras mode="vinyl"/></SilverSiteShell>}
