export const BASE_URL = "https://achebestan.vercel.app";

export const ORG_ROLES = {
    writer: "writer",
    superAdmin: "superAdmin", // platform owner
    admin: "admin", // org specific
    member: "member", // default user
} as const;
