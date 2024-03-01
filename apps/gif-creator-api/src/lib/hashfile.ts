import crypto from "crypto";
export const hashFile = async (base64File: string) => {
    const data = new TextEncoder().encode(base64File);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return hashHex;
};
