import { z } from "zod";

const endpointSchema = z
  .string({ error: "endpoint দিতে হবে" })
  .trim()
  .max(2048)
  .refine((value) => value.startsWith("https://"), "endpoint সঠিক নয়");

export const subscribePushSchema = z.object({
  endpoint: endpointSchema,
  keys: z.object({
    p256dh: z.string().trim().min(1).max(512),
    auth: z.string().trim().min(1).max(512),
  }),
});

export const unsubscribePushSchema = z.object({
  endpoint: endpointSchema,
});

export type SubscribePushInput = z.infer<typeof subscribePushSchema>;
export type UnsubscribePushInput = z.infer<typeof unsubscribePushSchema>;
