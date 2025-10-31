"use client";

import { ImageDropzone, UploadImageDropZoneProps } from "../ui/dropzone";

import { ActionIcon, Box, Image as MantineImage } from "@mantine/core";

import { authClient } from "@/lib/auth-client";

import homeStyles from "@/styles/home-hero.module.css";
import publicStyles from "@/styles/public.module.css";
import cx from "clsx";

import { useDisclosure } from "@mantine/hooks";
import { IconPhotoEdit } from "@tabler/icons-react";

export function HomeImageUpload({ ...props }: UploadImageDropZoneProps) {
    return <ImageDropzone action="uploadImage" {...props} />;
}

export function HomeImage({ userImage }: { userImage?: string | null }) {
    return (
        <figure>
            <MantineImage
                src={userImage ? userImage : "/images/demo.jpg"}
                alt="image"
            />
            <figcaption>A Mad Man, circa 2025</figcaption>
        </figure>
    );
}

export function HomeImageBox({
    session,
}: {
    session: ReturnType<typeof authClient.useSession>["data"];
}) {
    const [
        openedImageField,
        { toggle: toggleImageField, close: closeImageField },
    ] = useDisclosure(false);

    return (
        <Box className={cx(publicStyles.relative, homeStyles.heroImage)}>
            {openedImageField && session?.user && !session.user.isAnonymous ? (
                <HomeImageUpload
                    imageUniqueId={session.user.id}
                    onSetttled={closeImageField}
                    maxFiles={1}
                />
            ) : (
                <HomeImage userImage={session?.user.image} />
            )}

            <ActionIcon
                onClick={() => {
                    toggleImageField();
                }}
                title="Update Your Home Image"
                className={cx(
                    homeStyles.imageFieldToggle,
                    (!session?.user || session.user.isAnonymous) &&
                        publicStyles.hide
                )}
                color="yellow"
                variant="light"
                size={"xs"}
            >
                <IconPhotoEdit />
            </ActionIcon>
        </Box>
    );
}
