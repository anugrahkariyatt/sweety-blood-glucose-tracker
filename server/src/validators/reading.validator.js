
import { z } from "zod";

const readingSlots = [
    "MORNING",
    "AFTER_BREAKFAST",
    "AFTER_LUNCH",
    "AFTER_DINNER",
];

export const createReadingSchema = z.object({
    date: z
        .string()
        .min(1, "Please select a date.")
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date.")
        .refine((date) => {
            const parsedDate = new Date(`${date}T00:00:00.000Z`);

            return (
                !Number.isNaN(parsedDate.getTime()) &&
                parsedDate.toISOString().slice(0, 10) === date
            );
        }, "Please enter a valid date.")
        .refine((date) => {
            const today = new Date().toLocaleDateString("en-CA", {
                timeZone: "Asia/Kolkata",
            });

            return date <= today;
        }, "Date cannot be in the future."),

    slot: z
        .string()
        .min(1, "Please select a time slot.")
        .refine((slot) => readingSlots.includes(slot), {
            message: "Please select a valid time slot.",
        }),

    value: z
        .number({
            error: "Value must be a number.",
        })
        .int("Value must be a whole number.")
        .min(40, "Value must be between 40 and 600 mg/dl.")
        .max(600, "Value must be between 40 and 600 mg/dl."),
});

