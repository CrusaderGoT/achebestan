import { user } from "@/drizzle/schemas/user";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const signupSchema = z.object({
    email: z.email({ error: "enter a valid email" }),
    password: z
        .string({
            error: "input must be letter, number, or special character",
        })
        .min(8, { error: "minimun of 8 characters" })
        .max(20, { error: "maximun of 20 characters" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_+-=;:'",.<>?]).{8,20}/, {
            error: `
            password must be within 8-20 characters,
            contain at least a uppercase letter, 
            a lowercase letter, a number, 
            and a special character from !@#$%^&*_+-=;:'",.<>?
            `,
        }),
    name: z
        .string({ error: "type in your name as an author" })
        .min(3, { error: "name must be at least 3 characters" })
        .max(20, { error: "maximum of 20 letters" })
        .regex(/^[A-Za-z]+$/, { error: "name must be only letters" }),
    image: z.url().optional(),
});

export type SignupSchemaType = z.infer<typeof signupSchema>;

export const userUpdateSchema = z.object({
    name: z
        .string()
        .min(3, { error: "name must be at least 3 characters" })
        .regex(/^[A-Za-z]+$/, { error: "name must be only letters" })
        .optional(),
    image: z.url().optional(),
    email: z.email({ error: "enter a valid email" }).optional(),
});

export const userSelectSchema = createSelectSchema(user);

export const loginSchema = z.object({
    email: z.email({ error: "enter a valid email" }),
    password: z
        .string({
            error: "input must be letter, number, or special character",
        })
        .min(8, { error: "minimun of 8 characters" })
        .max(20, { error: "maximun of 20 characters" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_+-=;:'",.<>?]).{8,20}/, {
            error: `
            password must be within 8-20 characters,
            contain at least a uppercase letter, 
            a lowercase letter, a number, 
            and a special character from !@#$%^&*_+-=;:'",.<>?
            `,
        }),
});
