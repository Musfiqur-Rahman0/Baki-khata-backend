import { Prisma } from "../../generated/client/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppErrors } from "../../shared/erors/app.errors.js";
import {
  decimalToMinorUnits,
  minorUnitsToDecimal,
} from "../../shared/utils/money.js";
import type {
  CreateTransactionInput,
  TransactionListQuery,
} from "./transaction.validation.js";

const transactionSelect = {
  id: true,
  customerId: true,
  type: true,
  amount: true,
  note: true,
  date: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TransactionSelect;

function getBalance(
  credit: Prisma.Decimal | null | undefined,
  payment: Prisma.Decimal | null | undefined,
) {
  const creditTotal = credit?.toString() ?? "0.00";
  const paymentTotal = payment?.toString() ?? "0.00";
  return {
    creditTotal,
    paymentTotal,
    due: minorUnitsToDecimal(
      decimalToMinorUnits(creditTotal) - decimalToMinorUnits(paymentTotal),
    ),
  };
}

async function getCustomerBalance(shopOwnerId: string, customerId: string) {
  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: { shopOwnerId, customerId },
    _sum: { amount: true },
  });
  return getBalance(
    totals.find(({ type }) => type === "CREDIT")?._sum.amount,
    totals.find(({ type }) => type === "PAYMENT")?._sum.amount,
  );
}

function serializeTransaction<T extends { amount: Prisma.Decimal }>(
  transaction: T,
) {
  return { ...transaction, amount: transaction.amount.toFixed(2) };
}

function makeWhere(
  shopOwnerId: string,
  query: TransactionListQuery,
): Prisma.TransactionWhereInput {
  return {
    shopOwnerId,
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.from || query.to
      ? {
          date: {
            ...(query.from
              ? { gte: new Date(`${query.from}T00:00:00.000Z`) }
              : {}),
            ...(query.to
              ? { lte: new Date(`${query.to}T23:59:59.999Z`) }
              : {}),
          },
        }
      : {}),
  };
}

export async function createTransaction(
  shopOwnerId: string,
  input: CreateTransactionInput,
) {
  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, shopOwnerId, archivedAt: null },
    select: { id: true },
  });
  if (!customer) throw AppErrors.notFound("সক্রিয় গ্রাহক");

  const transaction = await prisma.transaction.create({
    data: {
      shopOwnerId,
      customerId: customer.id,
      type: input.type,
      amount: input.amount,
      note: input.note,
      ...(input.date ? { date: new Date(input.date) } : {}),
    },
    select: transactionSelect,
  });
  return serializeTransaction(transaction);
}

export async function listTransactions(
  shopOwnerId: string,
  query: TransactionListQuery,
) {
  const where = makeWhere(shopOwnerId, query);
  const skip = (query.page - 1) * query.limit;
  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      select: {
        ...transactionSelect,
        customer: { select: { name: true, phone: true } },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip,
      take: query.limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: transactions.map(serializeTransaction),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getTransaction(
  shopOwnerId: string,
  transactionId: string,
) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, shopOwnerId },
    select: transactionSelect,
  });
  if (!transaction) throw AppErrors.notFound("লেনদেন");
  return serializeTransaction(transaction);
}

export async function getCustomerLedger(
  shopOwnerId: string,
  customerId: string,
  page: number,
  limit: number,
) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, shopOwnerId },
    select: { id: true, name: true, phone: true, archivedAt: true },
  });
  if (!customer) throw AppErrors.notFound("গ্রাহক");

  const where: Prisma.TransactionWhereInput = { shopOwnerId, customerId };
  const skip = (page - 1) * limit;
  const [transactions, total, balance] = await Promise.all([
    prisma.transaction.findMany({
      where,
      select: transactionSelect,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
    getCustomerBalance(shopOwnerId, customerId),
  ]);

  return {
    customer,
    balance,
    transactions: transactions.map(serializeTransaction),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}