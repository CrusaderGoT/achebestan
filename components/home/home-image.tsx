"use client";

import { authClient } from "@/lib/auth-client";
import { updateUserImage } from "@/lib/utils/user/update-user-image";
import homeStyles from "@/styles/home-hero.module.css";
import publicStyles from "@/styles/public.module.css";
import { ActionIcon, Box, Image as MantineImage } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPhotoEdit } from "@tabler/icons-react";
import cx from "clsx";
import dayjs from "dayjs";
import Image from "next/image";
import { ImageDropzone } from "../ui/dropzone";

function HomeImage({ userImage }: { userImage?: string | null }) {
    return (
        <figure className={homeStyles.heroImageContainer}>
            <MantineImage
                src={userImage || "/images/iq_detailed.png"}
                alt="Core of the Palace"
                component={Image}
                width={500}
                height={500}
                className={homeStyles.userImage}
                loading="eager"
            />
            <figcaption className={homeStyles.imageCaption}>
                Archive Ref: {dayjs().year()} AC — Brain Core
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
            {openedImageField && session?.user ? (
                <Box className={homeStyles.dropzoneContainer}>
                    <ImageDropzone
                        action="uploadImage"
                        imageUniqueId={session.user.id}
                        onSetttled={async (url) => {
                            await updateUserImage(url);
                            closeImageField();
                        }}
                        maxFiles={1}
                    />
                </Box>
            ) : (
                <HomeImage userImage={session?.user.image} />
            )}

            {session?.user && (
                <ActionIcon
                    onClick={toggleImageField}
                    className={homeStyles.imageFieldToggle}
                    variant="subtle"
                    size="lg"
                    radius="xl"
                >
                    <IconPhotoEdit size={22} color="var(--color-accent)" />
                </ActionIcon>
            )}
        </Box>
    );
}
