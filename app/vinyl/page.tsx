import type {Metadata} from "next";
import SilverSiteShell from "../../components/landing/SilverSiteShell";
import AngelExtras from "../../components/landing/AngelExtras";
export const metadata:Metadata={title:"ANGEL Vinyl",description:"Register interest in the ANGEL vinyl edition by Yarden. Availability, pricing and shipping will be confirmed by the artist's team.",alternates:{canonical:"/vinyl"}};
export default function VinylPage(){return <SilverSiteShell><AngelExtras mode="vinyl"/></SilverSiteShell>}
