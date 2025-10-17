"use server";

import "dotenv/config";

export const validatePasscode = async (code: string) => {
    if (code === process.env.CODE) {
        return true;
    }
    return false;
};
