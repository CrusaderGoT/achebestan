import { Modal, TextInput, Group, Button, Text, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import styles from "@/styles/bookmark/bookmark-modal.module.css";

interface BookmarkModalProps {
    opened: boolean;
    onClose: () => void;
    onSave: (note: string) => void;
    contextText: string;
}

export function BookmarkModal({
    opened,
    onClose,
    onSave,
    contextText,
}: BookmarkModalProps) {
    const form = useForm({
        initialValues: {
            note: "",
        },
    });

    const handleSubmit = (values: { note: string }) => {
        onSave(values.note);
        form.reset();
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Add Bookmark"
            size="md"
            centered
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <div>
                        <Text size="sm" fw={500} mb="xs">
                            Position context:
                        </Text>
                        <Text
                            size="sm"
                            c="dimmed"
                            className={styles.contextPreview}
                        >
                            {contextText}
                        </Text>
                    </div>

                    <TextInput
                        label="Note (optional)"
                        placeholder="Add a note to help you remember this bookmark"
                        {...form.getInputProps("note")}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Add Bookmark</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
