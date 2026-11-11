import { z } from "zod";

export const reportQuerySchema = z.object({
    date: z
        .string({
            error: "Please select a date.",
        })
        .min(1, "Please select a date.")
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date in YYYY-MM-DD format.")
        .refine((date) => {
            const parsedDate = new Date(`${date}T00:00:00.000Z`);
            return (
                !Number.isNaN(parsedDate.getTime()) &&
                parsedDate.toISOString().slice(0, 10) === date
            );
        }, "Please enter a valid date in YYYY-MM-DD format."),
});

