import {
    loginSchema,
    userSelectSchema,
    userUpdateSchema,
} from "@/zod-schemas/user";
import { z } from "zod/v4";

export type LoginFormState = "pending" | "success" | "idle" | "error";

export type UserUpdateSchemaType = z.infer<typeof userUpdateSchema>;

export type UserSelectType = z.infer<typeof userSelectSchema>;

export type LoginSchemaType = z.infer<typeof loginSchema>;
