import { prisma } from "../../lib/prisma.js";
import type { SubscribePushInput } from "./push.validation.js";

export async function savePushSubscription(
  shopOwnerId: string,
  input: SubscribePushInput,
) {
  await prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    update: {
      shopOwnerId,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
    },
    create: {
      shopOwnerId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
    },
  });
  return { subscribed: true };
}

export async function removePushSubscription(
  shopOwnerId: string,
  endpoint: string,
) {
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, shopOwnerId },
  });
  return { subscribed: false };
}