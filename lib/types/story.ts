import { StorySelectType } from "@/zod-schemas/story";
import { userSelectType } from "@/zod-schemas/user";

export interface StoryBookProp extends StorySelectType {
    author: userSelectType;
}
