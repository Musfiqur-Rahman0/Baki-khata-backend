import { Prisma } from "../../generated/client/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppErrors } from "../../shared/erors/app.errors.js";
import {
  decimalToMinorUnits,
  minorUnitsToDecimal,
} from "../../shared/utils/money.js";
import type {
  CustomerBalance,
  CustomerWithBalance,
} from "./customer.interface.js";
import type {
  CreateCustomerInput,
  CustomerListQuery,
  UpdateCustomerInput,
} from "./customer.validation.js";

const customerSelect = {
  id: true,
  shopOwnerId: true,
  name: true,
  phone: true,
  address: true,
  note: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CustomerSelect;

function mapBalance(
  creditAmount: Prisma.Decimal | null | undefined,
  paymentAmount: Prisma.Decimal | null | undefined,
): CustomerBalance {
  const credit = creditAmount?.toString() ?? "0.00";
  const payment = paymentAmount?.toString() ?? "0.00";

  return {
    creditTotal: credit,
    paymentTotal: payment,
    due: minorUnitsToDecimal(
      decimalToMinorUnits(credit) - decimalToMinorUnits(payment),
    ),
  };
}

async function getBalances(
  shopOwnerId: string,
  customerIds: string[],
): Promise<Map<string, CustomerBalance>> {
  const balances = new Map<string, CustomerBalance>();
  if (!customerIds.length) return balances;

  const aggregates = await prisma.transaction.groupBy({
    by: ["customerId", "type"],
    where: { shopOwnerId, customerId: { in: customerIds } },
    _sum: { amount: true },
  });
  const totals = new Map<
    string,
    { credit: Prisma.Decimal | null; payment: Prisma.Decimal | null }
  >();

  for (const aggregate of aggregates) {
    const total = totals.get(aggregate.customerId) ?? {
      credit: null,
      payment: null,
    };
    if (aggregate.type === "CREDIT") total.credit = aggregate._sum.amount;
    if (aggregate.type === "PAYMENT") total.payment = aggregate._sum.amount;
    totals.set(aggregate.customerId, total);
  }

  for (const customerId of customerIds) {
    const total = totals.get(customerId);
    balances.set(customerId, mapBalance(total?.credit, total?.payment));
  }
  return balances;
}

function withBalance(
  customer: Prisma.CustomerGetPayload<{ select: typeof customerSelect }>,
  balance: CustomerBalance,
): CustomerWithBalance {
  const { shopOwnerId: _shopOwnerId, ...publicCustomer } = customer;
  return { customer: publicCustomer, balance };
}

async function findOwnedCustomer(
  shopOwnerId: string,
  customerId: string,
  includeArchived = false,
) {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      shopOwnerId,
      ...(includeArchived ? {} : { archivedAt: null }),
    },
    select: customerSelect,
  });
  if (!customer) throw AppErrors.notFound("গ্রাহক");
  return customer;
}

export async function createCustomer(
  shopOwnerId: string,
  input: CreateCustomerInput,
): Promise<CustomerWithBalance> {
  try {
    const customer = await prisma.customer.create({
      data: {
        shopOwnerId,
        name: input.name,
        phone: input.phone,
        address: input.address,
        note: input.note,
      },
      select: customerSelect,
    });
    return withBalance(customer, mapBalance(null, null));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw AppErrors.conflict("এই মোবাইল নম্বরের গ্রাহক আগে থেকেই আছে");
    }
    throw error;
  }
}

export async function listCustomers(
  shopOwnerId: string,
  query: CustomerListQuery,
) {
  const where: Prisma.CustomerWhereInput = {
    shopOwnerId,
    archivedAt: query.archived === "true" ? { not: null } : null,
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { phone: { contains: query.search } },
          ],
        }
      : {}),
  };
  const skip = (query.page - 1) * query.limit;
  const [customers, total] = await prisma.$transaction([
    prisma.customer.findMany({
      where,
      select: customerSelect,
      orderBy: { updatedAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.customer.count({ where }),
  ]);
  const balances = await getBalances(
    shopOwnerId,
    customers.map(({ id }) => id),
  );

  return {
    customers: customers.map((customer) =>
      withBalance(customer, balances.get(customer.id) ?? mapBalance(null, null)),
    ),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getCustomer(
  shopOwnerId: string,
  customerId: string,
): Promise<CustomerWithBalance> {
  const customer = await findOwnedCustomer(shopOwnerId, customerId);
  const balances = await getBalances(shopOwnerId, [customerId]);
  return withBalance(
    customer,
    balances.get(customerId) ?? mapBalance(null, null),
  );
}

export async function updateCustomer(
  shopOwnerId: string,
  customerId: string,
  input: UpdateCustomerInput,
): Promise<CustomerWithBalance> {
  await findOwnedCustomer(shopOwnerId, customerId);
  try {
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: input,
      select: customerSelect,
    });
    const balances = await getBalances(shopOwnerId, [customerId]);
    return withBalance(
      customer,
      balances.get(customerId) ?? mapBalance(null, null),
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw AppErrors.conflict("এই মোবাইল নম্বরের গ্রাহক আগে থেকেই আছে");
    }
    throw error;
  }
}

export async function archiveCustomer(shopOwnerId: string, customerId: string) {
  await findOwnedCustomer(shopOwnerId, customerId);
  return prisma.customer.update({
    where: { id: customerId },
    data: { archivedAt: new Date() },
    select: { id: true, archivedAt: true },
  });
}

export async function restoreCustomer(shopOwnerId: string, customerId: string) {
  await findOwnedCustomer(shopOwnerId, customerId, true);
  try {
    return await prisma.customer.update({
      where: { id: customerId },
      data: { archivedAt: null },
      select: customerSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw AppErrors.conflict(
        "একই মোবাইল নম্বরে সক্রিয় গ্রাহক রয়েছে; আগে সেই গ্রাহকের তথ্য পরিবর্তন করুন",
      );
    }
    throw error;
  }
}