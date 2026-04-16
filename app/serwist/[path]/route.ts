import { createSerwistRoute } from "@serwist/turbopack";
import { spawnSync } from "node:child_process";

// This is optional!
// A revision helps Serwist version a precached page. This
// avoids outdated precached responses being used. Using
// `git rev-parse HEAD` might not the most efficient way
// of determining a revision, however. You may prefer to use
// the hashes of every extra file you precache.
const revision =
    spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout ??
    crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
    createSerwistRoute({
        additionalPrecacheEntries: [{ url: "/~offline", revision }],
        swSrc: "app/sw.ts",
        // If set to `false`, Serwist will attempt to use `esbuild-wasm`.
        useNativeEsbuild: true,
        maximumFileSizeToCacheInBytes: 7 * 10 ** 6, // 7mb
    });
