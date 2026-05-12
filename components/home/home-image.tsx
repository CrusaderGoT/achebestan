"use client";

import { ImageDropzone } from "../ui/dropzone";

import { ActionIcon, Box, Image as MantineImage } from "@mantine/core";

import { authClient } from "@/lib/auth-client";

import homeStyles from "@/styles/home-hero.module.css";
import publicStyles from "@/styles/public.module.css";
import cx from "clsx";

import { updateUserImage } from "@/lib/utils/user/update-user-image";
import { useDisclosure } from "@mantine/hooks";
import { IconPhotoEdit } from "@tabler/icons-react";
import dayjs from "dayjs";
import Image from "next/image";

function HomeImage({ userImage }: { userImage?: string | null }) {
    return (
        <figure>
            <MantineImage
                src={userImage ? userImage : "/images/iq_detailed.png"}
                alt="image"
                component={Image}
            />
            <figcaption>
                Put the pen to the brain, {dayjs().year()} AC
            </figcaption>
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
                <ImageDropzone
                    action="uploadImage"
                    imageUniqueId={session.user.id}
                    onSetttled={async (url) => {
                        await updateUserImage(url);
                        closeImageField();
                    }}
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
                        publicStyles.hide,
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
