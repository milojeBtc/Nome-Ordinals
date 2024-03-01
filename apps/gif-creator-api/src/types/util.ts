import type { Request, Response, NextFunction } from "express";

import ErrorResponse from "../lib/error-response";

export type ErrorFormat = {
    date: Date;
    error: ErrorResponse;
    req: Request;
    res: Response;
    next: NextFunction;
};
