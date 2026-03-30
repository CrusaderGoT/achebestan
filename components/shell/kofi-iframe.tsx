import { Modal } from "@mantine/core";

export function KofiIframe({
    opened,
    close,
}: {
    opened: boolean;
    close: () => void;
}) {
    if (opened) {
        return (
            <Modal
                opened={opened}
                onClose={close}
                keepMounted
                title="Buy me KoFi"
            >
                <iframe
                    src="https://ko-fi.com/achebestan/?hidefeed=true&widget=true&embed=true&preview=true"
                    style={{
                        border: "none",
                        width: "100%",
                        padding: "4px",
                        background: "#f9f9f9",
                        borderRadius: "8px",
                    }}
                    height={712}
                    title="achebestan"
                ></iframe>
            </Modal>
        );
    }
}
