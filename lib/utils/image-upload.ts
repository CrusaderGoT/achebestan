"use server"; // to llow for direct use in use client components

import {
    v2 as cloudinary,
    UploadApiErrorResponse,
    UploadApiOptions,
    UploadApiResponse,
} from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

type CloudinaryResult =
    | { success: true; data: UploadApiResponse }
    | { success: false; error: UploadApiErrorResponse; errorType: "cloudinary" }
    | { success: false; error: { message: string }; errorType: "conversion" };

export async function uploadImageFile(
    file: File,
    publicId: string | undefined
): Promise<CloudinaryResult> {
    const options: UploadApiOptions = {
        resource_type: "image",
        folder: "achebestan",
        ...(publicId && { public_id: publicId }),
        overwrite: true,
    };

    try {
        const arrayBuffer = await file.arrayBuffer();
        const byteArrayBuffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<
            UploadApiResponse | UploadApiErrorResponse
        >((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(options, (error, uploadResult) => {
                    if (error) {
                        reject(error as UploadApiErrorResponse);
                    } else {
                        resolve(uploadResult as UploadApiResponse);
                    }
                })
                .end(byteArrayBuffer);
        });

        if ("http_code" in uploadResult && uploadResult.http_code >= 400) {
            return {
                success: false,
                error: uploadResult as UploadApiErrorResponse,
                errorType: "cloudinary",
            };
        }

        return { success: true, data: uploadResult as UploadApiResponse };
    } catch (error) {
        return {
            success: false,
            error: {
                message:
                    error instanceof Error
                        ? error.message
                        : "File conversion failed",
            },
            errorType: "conversion",
        };
    }
}

// Usage with  discriminated union
export async function handleFileUpload(
    file: File,
    publicId: string | undefined,
    { throwOnError = true }: { throwOnError: boolean }
) {
    const result = await uploadImageFile(file, publicId);

    if (result.success) {
        console.log("Upload successful:", result.data.secure_url);
        return result.data;
    } else {
        console.log(result);
        switch (result.errorType) {
            case "cloudinary":
                console.error(
                    "Image Upload Error -> Cloudinary error:",
                    result.error.message
                );
                break;
            case "conversion":
                console.error(
                    "Image Upload Error -> File conversion error:",
                    result.error.message
                );
                break;
        }
        if (throwOnError) {
            throw new Error(result.error.message || "Image Upload Failed");
        }
    }
}
