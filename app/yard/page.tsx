import type {Metadata} from "next";
import SilverSiteShell from "../../components/landing/SilverSiteShell";
import SilverMasthead from "../../components/landing/SilverMasthead";
import YardClient from "./YardClient";
export const metadata:Metadata={title:"The Yard",description:"Join the Yarden fan community and make your own Yard Pass.",alternates:{canonical:"/yard"}};
export default function YardPage(){return <SilverSiteShell><SilverMasthead kicker="THE YARD / YARDEN" title="Come closer." description="For people who feel the music beyond the records."/><YardClient/></SilverSiteShell>}
