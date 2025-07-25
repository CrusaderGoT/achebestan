"use client";

import { Input, InputWrapperProps } from "@mantine/core";

import { Link, RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface StoryRichTextEditorProps extends Omit<InputWrapperProps, "onChange"> {
    value: string;
    onChange?(value: string): void;
}

export function StoryRichTextEditor({
    value,
    onChange,
    ...props
}: StoryRichTextEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit, Link],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    });

    return (
        <Input.Wrapper {...props}>
            <RichTextEditor
                editor={editor}
                mah={500}
                h={300}
                style={
                    props.error
                        ? { borderColor: "red", color: "red" }
                        : { overflowY: "auto" }
                }
            >
                <RichTextEditor.Toolbar sticky>
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.BulletList />
                        <RichTextEditor.OrderedList />
                        <RichTextEditor.Hr />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Strikethrough />
                        <RichTextEditor.ClearFormatting />
                        <RichTextEditor.Blockquote />
                        <RichTextEditor.Code />
                        <RichTextEditor.CodeBlock />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.H1 />
                        <RichTextEditor.H2 />
                        <RichTextEditor.H3 />
                        <RichTextEditor.H4 />
                        <RichTextEditor.H5 />
                        <RichTextEditor.H6 />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Undo />
                        <RichTextEditor.Redo />
                    </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>

                <RichTextEditor.Content />
            </RichTextEditor>
        </Input.Wrapper>
    );
}
