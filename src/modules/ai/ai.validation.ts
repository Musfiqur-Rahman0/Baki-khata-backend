import { z } from "zod";

const amountSchema = z
  .union([z.string(), z.number().finite()])
  .transform((value) => String(value).trim().replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit))))
  .pipe(
    z.string().regex(/^\d{1,10}(?:\.\d{1,2})?$/, "সঠিক টাকার পরিমাণ দিন")
      .refine((value) => Number(value) > 0, "টাকার পরিমাণ শূন্যের বেশি হতে হবে"),
  );

const parsedTransactionSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  type: z.enum(["CREDIT", "PAYMENT"]),
  amount: amountSchema,
  note: z.string().trim().max(1000).nullable().optional(),
  date: z.string().date().nullable().optional(),
  confidence: z.number().min(0).max(1).optional(),
  needsClarification: z.boolean().optional(),
  clarificationReason: z.string().trim().max(500).nullable().optional(),
});

export const parseTransactionRequestSchema = z.object({
  text: z.string().trim().min(2, "লেনদেনের বিবরণ লিখুন").max(4000, "ইনপুট সর্বোচ্চ ৪০০০ অক্ষরের হতে পারে"),
});

export const confirmTransactionsRequestSchema = z.object({
  transactions: z.array(z.object({
    customerId: z.string().trim().min(1, "গ্রাহক নির্বাচন করুন"),
    type: z.enum(["CREDIT", "PAYMENT"]),
    amount: amountSchema,
    note: z.string().trim().max(1000).nullable().optional(),
    // YYYY-MM-DD; omitted means use the current timestamp.
    date: z.string().date().optional(),
  })).min(1, "অন্তত একটি লেনদেন দিন").max(30, "একবারে সর্বোচ্চ ৩০টি লেনদেন সংরক্ষণ করা যাবে"),
});

export type ParsedAiTransaction = z.infer<typeof parsedTransactionSchema>;
export const aiParsedTransactionSchema = parsedTransactionSchema;
export type ParseTransactionRequest = z.infer<typeof parseTransactionRequestSchema>;
export type ConfirmTransactionsRequest = z.infer<typeof confirmTransactionsRequestSchema>;
