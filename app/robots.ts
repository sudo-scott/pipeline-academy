import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules:{userAgent:"*",allow:"/",disallow:["/admin","/instructor","/account"]}, sitemap:"https://pipeline-academy.openai.app/sitemap.xml" }; }
