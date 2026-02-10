import { Request, Response } from "express";
import express from "express";
const app = express();
app.get("/health", (req: Request, res: Response): Response => {
    try {
        return res.status(200).json({
            status: "ok",
            message: "server is alive",
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || "development"
        });
    } catch (err: unknown) {
        console.error(err);

        const errorMessage =
            err instanceof Error ? err.message : "Unknown error";

        return res.status(503).json({
            status: "error",
            message: errorMessage
        });
    }
});
