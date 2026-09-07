import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const paths = [
    "",
    "/services",
    "/memberships",
    "/new-home-setup",
    "/tech-support-for-parents",
    "/small-business",
    "/about",
    "/contact",
    "/book",
    "/faq",
    "/privacy",
    "/terms",
    "/cancellation",
  ];
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
