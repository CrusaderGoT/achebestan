import { CommentUpdateType } from "@/zod-schemas/comment";
import { Textarea, TextareaProps } from "@mantine/core";
import { createFormContext } from "@mantine/form";

type CommentAreaProps = Partial<TextareaProps>;

export const [
    UpdateCommentFormProvider,
    useUpdateCommentFormContext,
    useUpdateCommentForm,
] = createFormContext<CommentUpdateType>();

export function UpdateCommentArea({ ...props }: CommentAreaProps) {
    const form = useUpdateCommentFormContext();

    return (
        <Textarea
            key={form.key("text")}
            {...form.getInputProps("text")}
            {...props}
        />
    );
}
