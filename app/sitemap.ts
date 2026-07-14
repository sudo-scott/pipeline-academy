import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/site-url";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/about",
    "/curriculum",
    "/pricing",
    "/contact",
    "/glossary",
    "/lab",
    "/privacy",
    "/terms",
    "/accessibility",
  ].map((path) => ({
    url: `${siteUrl()}${path}`,
    lastModified: new Date("2026-07-14"),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
