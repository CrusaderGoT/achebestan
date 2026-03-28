"use client";

import { getUserBooks } from "@/lib/actions/book";
import { useCentralizedAuth } from "@/lib/auth/centralized-auth-context-provider";
import { useCreateBook } from "@/lib/hooks/book/create-book-hook";
import {
    Button,
    ComboboxData,
    ComboboxItem,
    Group,
    Modal,
    NumberInput,
    Select,
    Stack,
    TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

export function BooksSelect({
    bookId,
    setBookId,
    bookPart,
    setBookPart,
}: {
    bookId: ComboboxItem | null;
    setBookId: Dispatch<SetStateAction<ComboboxItem | null>>;
    bookPart: number | string;
    setBookPart: Dispatch<SetStateAction<number | string>>;
}) {
    const [userBooks, setUserBooks] = useState<ComboboxData>([]);

    const { sessionUser } = useCentralizedAuth();

    const userId = useMemo(() => {
        return sessionUser.data?.user.id;
    }, [sessionUser.data?.user.id]);

    useEffect(() => {
        if (!userId) return;

        async function getUserBooksEffect() {
            if (!userId) return;

            const books = await getUserBooks(userId, userBooks.length || 1);
            if (books) {
                setUserBooks(() => {
                    const normalizedData: ComboboxData = books.map((d) => {
                        return {
                            value: `${d.id}`,
                            label: d.name,
                        };
                    });

                    return [...normalizedData];
                });
            }
        }

        getUserBooksEffect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    return (
        <>
            {userBooks.length > 0 && (
                <Group>
                    <Select
                        data={userBooks}
                        value={bookId ? bookId.value : null}
                        onChange={(_value, option) => setBookId(option)}
                        label="Choose a Book to add this story"
                        placeholder="Pick Book"
                        description="pick a book or create a new one"
                        searchable
                        size="xs"
                    />

                    {bookId && (
                        <NumberInput
                            value={bookPart}
                            onChange={setBookPart}
                            min={1}
                            max={1000}
                            clampBehavior="strict"
                            label="Chapter Number"
                            description="Enter a chapter number, entering an existing chapter number will result in an error."
                            placeholder="enter a number between 1 and 100"
                            size="xs"
                        />
                    )}
                </Group>
            )}

            <CreateBookModal setNewBook={setUserBooks} />
        </>
    );
}

function CreateBookModal({
    setNewBook,
}: {
    setNewBook: Dispatch<SetStateAction<ComboboxData>>;
}) {
    const [opened, { open, close }] = useDisclosure(false);

    const [value, setValue] = useState("");

    const { executeAsync, isPending } = useCreateBook();

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
                                const normalizedData: ComboboxItem = {
                                    value: `${newBook.data.id}`,
                                    label: newBook.data.name,
                                };
                                setNewBook((prev) => {
                                    return [...prev, normalizedData];
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
            >
                Create New Book
            </Button>
        </>
    );
}
