import publicStyles from "@/styles/public.module.css";
import cx from "clsx";

import { Box, Button, ComboboxItem, Transition } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { IconBookUpload } from "@tabler/icons-react";

import { Dispatch, SetStateAction } from "react";
import { BooksSelect } from "../book/books-select";

import { useUpdateStory } from "@/lib/hooks/story/update-story";
import { useDisclosure } from "@mantine/hooks";

export type AddStoryToBookProps = {
    canUpdate: boolean | undefined;
    bookIdState: ComboboxItem | null;
    setBookIdState: Dispatch<SetStateAction<ComboboxItem | null>>;
    showMoveToBookButton: boolean;
    executeAsync: ReturnType<typeof useUpdateStory>["executeAsync"];
};

export function AddStoryToBook({
    bookIdState,
    setBookIdState,
    showMoveToBookButton,
    canUpdate,
    executeAsync,
}: AddStoryToBookProps) {
    const [opened, { toggle, close }] = useDisclosure(false);

    return (
        <Box mt={"xs"} className={cx(!canUpdate && publicStyles.hide)}>
            <Transition
                mounted={opened}
                transition="scale-y"
                duration={400}
                timingFunction="ease"
                keepMounted
            >
                {(styles) => (
                    <div style={styles}>
                        <BooksSelect
                            book={bookIdState}
                            setBook={setBookIdState}
                        />

                        {showMoveToBookButton && (
                            <Button
                                variant="transparent"
                                leftSection={<IconBookUpload size={15} />}
                                size="xs"
                                color="yellow"
                                onClick={async () => {
                                    if (!bookIdState) {
                                        notifications.show({
                                            message:
                                                "Please select a book to move the story to",
                                            color: "red",
                                        });
                                        return;
                                    }

                                    const updatedStory = await executeAsync({
                                        bookId: Number(bookIdState.value),
                                    });

                                    if (updatedStory.data) {
                                        notifications.show({
                                            message: `Story moved to book '${bookIdState.label}'`,
                                            color: "green",
                                        });

                                        setBookIdState(null);
                                        close();
                                    } else {
                                        notifications.show({
                                            message: `Failed to move story to book '${bookIdState.label}'`,
                                            color: "red",
                                        });
                                    }
                                }}
                            >
                                Move to book
                            </Button>
                        )}
                    </div>
                )}
            </Transition>

            <Button
                onClick={toggle}
                size="compact-xs"
                variant="subtle"
                color={opened ? "red" : "green"}
            >
                {opened ? "Cancel" : "Move story to a book?"}
            </Button>
        </Box>
    );
}
