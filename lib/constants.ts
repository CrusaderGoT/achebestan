export const isProduction = process.env.NODE_ENV === "production";

export const BASE_URL = !!isProduction
    ? "https://achebestan.vercel.app"
    : "http://localhost:3000";

export const ORG_ROLES = {
    writer: "writer",
    superAdmin: "superAdmin", // platform owner
    admin: "admin", // org specific
    member: "member", // default user
    owner: "owner", // org specific
} as const;
