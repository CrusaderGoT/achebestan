import { auth } from "@/lib/auth/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
