import { StorySelectType } from "@/zod-schemas/story";
import { userSelectType } from "@/zod-schemas/user";

export interface StoryBookProps extends StorySelectType {
    author: userSelectType;
}
export type PickedStoryProps = Pick<
    StorySelectType,
    "content" | "title" | "blurb" | "isbn" | "authorId"
>;
