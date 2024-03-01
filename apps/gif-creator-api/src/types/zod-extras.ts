import { getAddressInfo } from "bitcoin-address-validation";
import z from "zod";

export const safeInt = z.number().safe().positive({
    message: "Must be a positive integer",
});

export const taprootAddress = z
    .string()
    .refine(
        (x) => getAddressInfo(x).type === "p2tr",
        "Invalid taproot address"
    );
