"use client";

import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { useCreateBook } from "@/lib/hooks/book/create-book-hook";
import { useUserBooks } from "@/lib/hooks/book/get-user-books";
import {
    Button,
    ComboboxItem,
    Modal,
    Select,
    Stack,
    TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useState } from "react";

export function BooksSelect({
    bookId,
    setBookId,
}: {
    bookId: ComboboxItem | null;
    setBookId: Dispatch<SetStateAction<ComboboxItem | null>>;
}) {
    const { sessionUser } = useCentralizedAuth();

    const userId = sessionUser.data?.user.id;

    const {
        data: userBooks,
        error,
        isLoading,
    } = useUserBooks({
        userId: userId,
        offset: 1,
        limit: 10,
    });
    // TO DO, ADD PAGINATION OR USE DELAYED SEARCH IF NONE

    return (
        <>
            {!error && userBooks && (
                <Select
                    data={userBooks}
                    value={bookId ? bookId.value : null}
                    onChange={(_value, option) => {
                        setBookId(option);
                    }}
                    label="Choose a Book to add this story to"
                    placeholder="Pick Book"
                    description="pick a book or create a new one"
                    searchable
                    size="xs"
                    w={"300"}
                />
            )}

            {!isLoading && !!userId && <CreateBookModal />}
        </>
    );
}

function CreateBookModal() {
    const [opened, { open, close }] = useDisclosure(false);

    const [value, setValue] = useState("");

    const { executeAsync, isPending } = useCreateBook();

    const queryClient = useQueryClient();

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                centered
                withCloseButton={false}
            >
                <Stack>
                    <TextInput
                        value={value}
                        onChange={(event) =>
                            setValue(event.currentTarget.value)
                        }
                        placeholder="enter book name"
                        label="New Book"
                        description="Create a new book, entering an existing book name will result in an error."
                    />

                    <Button
                        disabled={!value || isPending}
                        onClick={async () => {
                            const newBook = await executeAsync({ name: value });
                            if (newBook.data) {
                                // invalidate user books query
                                queryClient.invalidateQueries({
                                    queryKey: [
                                        "user-books",
                                        { userId: newBook.data.authorId },
                                    ],
                                });

                                setValue("");
                                close();
                            }
                        }}
                        size="xs"
                    >
                        Create
                    </Button>
                </Stack>
            </Modal>

            <Button
                onClick={open}
                variant="transparent"
                leftSection={<IconPlus size={15} />}
                size="xs"
                color="green"
            >
                Create New Book
            </Button>
        </>
    );
}
