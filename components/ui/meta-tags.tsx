"use client";
export function MetaTags({ authorName }: { authorName: string }) {
    return (
        <meta
            name="copyright"
            content={`© ${new Date().getFullYear()} ${authorName} (Achebestan)`}
        />
    );
}
