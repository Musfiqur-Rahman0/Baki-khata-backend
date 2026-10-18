import { z } from "zod";
import { TransactionType } from "../../generated/client/enums.js";
import { decimalToMinorUnits } from "../../shared/utils/money.js";

const toEnglishDigits = (value: string): string =>
  value.replace(/[০-৯]/g, (digit) =>
    String("০১২৩৪৫৬৭৮৯".indexOf(digit)),
  );

const amountSchema = z
  .union([
    z.string({ error: "টাকার পরিমাণ দিতে হবে" }),
    z.number({ error: "টাকার পরিমাণ দিতে হবে" }).finite(),
  ])
  .transform((amount) => toEnglishDigits(String(amount).trim()))
  .pipe(
    z
      .string()
      .regex(/^\d{1,10}(?:\.\d{1,2})?$/, "সঠিক টাকার পরিমাণ দিন")
      .refine((amount) => decimalToMinorUnits(amount) > 0n, {
        message: "টাকার পরিমাণ শূন্যের বেশি হতে হবে",
      }),
  );

const noteSchema = z
  .string()
  .trim()
  .max(1000, "নোট সর্বোচ্চ ১০০০ অক্ষরের হতে পারে")
  .transform((note) => (note.length ? note : null))
  .nullable()
  .optional();

export const createTransactionSchema = z.object({
  customerId: z.string().trim().min(1, "গ্রাহক নির্বাচন করুন"),
  type: z.enum(TransactionType, {
    error: "লেনদেনের ধরন নির্বাচন করুন",
  }),
  amount: amountSchema,
  note: noteSchema,
  date: z.iso.datetime({ offset: true }).optional(),
});

export const transactionIdParamsSchema = z.object({
  transactionId: z.string().trim().min(1, "লেনদেন আইডি দিতে হবে"),
});

export const customerLedgerParamsSchema = z.object({
  customerId: z.string().trim().min(1, "গ্রাহক আইডি দিতে হবে"),
});

export const transactionListQuerySchema = z
  .object({
    customerId: z.string().trim().min(1).optional(),
    type: z.enum(TransactionType).optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine(
    ({ from, to }) => !from || !to || from <= to,
    { path: ["to"], message: "শুরুর তারিখ শেষের তারিখের পরে হতে পারে না" },
  );

export type CreateTransactionInput = z.infer<
  typeof createTransactionSchema
>;
export type TransactionListQuery = z.infer<
  typeof transactionListQuerySchema
>;