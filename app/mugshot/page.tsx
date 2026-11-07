import type {Metadata} from "next";
import SilverSiteShell from "../../components/landing/SilverSiteShell";
import SilverMasthead from "../../components/landing/SilverMasthead";
import AngelExtras from "../../components/landing/AngelExtras";
export const metadata:Metadata={title:"ANGEL Mugshot",description:"Create a personalized ANGEL promotional mugshot with your own selfie.",alternates:{canonical:"/mugshot"}};
export default function MugshotPage(){return <SilverSiteShell><SilverMasthead kicker="YARDEN / THE ANGEL FILES" title="Wanted for love." description="Get your own ANGEL booking photo."/><AngelExtras mode="mugshot"/></SilverSiteShell>}
