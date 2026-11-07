import type { MetadataRoute } from "next";
import { SITE_URL } from "../libs/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about", "/contact", "/careers", "/privacy", "/terms"].map((path) => ({
    url: new URL(path, SITE_URL).toString(),
  }));
}
