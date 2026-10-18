import { z } from "zod";

const businessTypes = [
  "GROCERY",
  "PHARMACY",
  "CLOTHING_TAILORING",
  "ELECTRONICS",
  "RESTAURANT_CAFE",
  "OTHER",
] as const;

const phoneSchema = z
  .string({ error: "মোবাইল নম্বর দিতে হবে" })
  .trim()
  .transform((phone) =>
    phone.replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit))),
  )
  .transform((phone) => phone.replace(/[\s()-]/g, ""))
  .transform((phone) => {
    if (phone.startsWith("+880")) return phone;
    if (phone.startsWith("880")) return `+${phone}`;
    if (phone.startsWith("0")) return `+88${phone}`;
    if (phone.startsWith("1")) return `+880${phone}`;
    return phone;
  })
  .pipe(
    z.string().regex(/^\+8801[3-9]\d{8}$/, "সঠিক বাংলাদেশি মোবাইল নম্বর দিন"),
  );

const pinSchema = z
  .string({ error: "পিন দিতে হবে" })
  .transform((pin) =>
    pin.replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit))),
  )
  .pipe(z.string().regex(/^\d{6}$/, "পিন ঠিক ৬ সংখ্যার হতে হবে"));

export const registerSchema = z.object({
  name: z
    .string({ error: "দোকানদারের নাম দিতে হবে" })
    .trim()
    .min(1, "দোকানদারের নাম দিতে হবে")
    .max(100, "নাম ১০০ অক্ষরের মধ্যে হতে হবে"),
  shopName: z
    .string({ error: "দোকানের নাম দিতে হবে" })
    .trim()
    .min(1, "দোকানের নাম দিতে হবে")
    .max(100, "দোকানের নাম ১০০ অক্ষরের মধ্যে হতে হবে"),
  businessType: z.enum(businessTypes, {
    error: "দোকানের ব্যবসার ধরন নির্বাচন করুন",
  }),
  phone: phoneSchema,
  pin: pinSchema,
});

export const loginSchema = z.object({
  phone: phoneSchema,
  pin: pinSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
