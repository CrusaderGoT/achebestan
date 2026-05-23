// app/robots.ts
import { BASE_URL } from "@/lib/constants";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                // 1. General Rules for Standard Search Engines
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/", // Protect backend API endpoints
                    "/_next/", // Block Next.js internal build files
                    "/static/", // Block raw static files if unnecessary
                    "/search", // Block search result pages to prevent crawl loops
                ],
            },
            {
                // 2. Proactively block common AI Scrapers / LLM Bots
                userAgent: [
                    "GPTBot", // OpenAI
                    "ChatGPT-User", // ChatGPT Web Browsing
                    "ClaudeBot", // Anthropic Claude
                    "PerplexityBot", // Perplexity AI
                    "Google-Extended", // Google's AI/Gemini training crawler
                ],
                disallow: "/", // Keep your stories out of AI training datasets
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
