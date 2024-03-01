import { OrdinalsBotErrorResponse } from "../types/ordinals-bot";

export default class ErrorResponse extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number
    ) {
        super(message);
    }
}

export const buildOrdinalsBotError = (body: OrdinalsBotErrorResponse) => {
    return new ErrorResponse(body.error || body.reason, 500);
};
