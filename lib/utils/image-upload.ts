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

const options: UploadApiOptions = {
    resource_type: "image",
    use_filename: false,
    unique_filename: true,
    folder: "achebestan",
};

type CloudinaryResult =
    | { success: true; data: UploadApiResponse }
    | { success: false; error: UploadApiErrorResponse; errorType: "cloudinary" }
    | { success: false; error: { message: string }; errorType: "conversion" };

async function uploadImageFile(file: File): Promise<CloudinaryResult> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const byteArrayBuffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<
            UploadApiResponse | UploadApiErrorResponse
        >((resolve) => {
            cloudinary.uploader
                .upload_stream(options, (error, uploadResult) => {
                    if (error) {
                        resolve(error as UploadApiErrorResponse);
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
    { throwOnError = true }: { throwOnError: boolean }
) {
    const result = await uploadImageFile(file);

    if (result.success) {
        console.log("Upload successful:", result.data.secure_url);
        return result.data;
    } else {
        switch (result.errorType) {
            case "cloudinary":
                console.error("Cloudinary error:", result.error.message);
                break;
            case "conversion":
                console.error("File conversion error:", result.error.message);
                break;
        }
        if (throwOnError) {
            console.log(result.error.message);
            throw new Error(result.error.message);
        }
    }
}
