import { z } from "zod/v4";


export const actionMetadatSchema = z.object({
    actionName: z.string(),
    user: z.string(),
});
