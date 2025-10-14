export const BASE_URL = "https://achebestan.vercel.app/";

export const MEMBER_ROLES = {
    writer: "writer",
    superAdmin: "super-admin", // platform owner
    admin: "admin", // platform wide
    user: "user",
    moderator: "moderator", // org specific
} as const;
