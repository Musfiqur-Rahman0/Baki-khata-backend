import { z } from "zod";

const toEnglishDigits = (value: string): string =>
  value.replace(/[০-৯]/g, (digit) =>
    String("০১২৩৪৫৬৭৮৯".indexOf(digit)),
  );

export const customerPhoneSchema = z
  .string({ error: "মোবাইল নম্বর দিতে হবে" })
  .trim()
  .transform(toEnglishDigits)
  .transform((phone) => phone.replace(/[\s()-]/g, ""))
  .transform((phone) => {
    if (phone.startsWith("+880")) return phone;
    if (phone.startsWith("880")) return `+${phone}`;
    if (phone.startsWith("0")) return `+88${phone}`;
    if (phone.startsWith("1")) return `+880${phone}`;
    return phone;
  })
  .pipe(
    z
      .string()
      .regex(/^\+8801[3-9]\d{8}$/, "সঠিক বাংলাদেশি মোবাইল নম্বর দিন"),
  );

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `সর্বোচ্চ ${maxLength} অক্ষর হতে পারে`)
    .transform((value) => (value.length ? value : null))
    .nullable()
    .optional();

export const createCustomerSchema = z.object({
  name: z
    .string({ error: "গ্রাহকের নাম দিতে হবে" })
    .trim()
    .min(1, "গ্রাহকের নাম দিতে হবে")
    .max(100, "নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে"),
  phone: customerPhoneSchema,
  address: optionalText(300),
  note: optionalText(1000),
});

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "অন্তত একটি তথ্য পরিবর্তন করুন",
  });

export const customerIdParamsSchema = z.object({
  customerId: z.string().trim().min(1, "গ্রাহক আইডি দিতে হবে"),
});

export const customerListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  archived: z.enum(["true", "false"]).default("false"),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;