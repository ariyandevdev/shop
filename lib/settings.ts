"use server";

import { requireAdmin } from "./admin";
import { prisma } from "./prisma";
import { auth } from "./auth";

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.settings.findUnique({
    where: { key },
  });
  return setting?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await requireAdmin();
  const session = await auth();

  await prisma.settings.upsert({
    where: { key },
    update: {
      value,
      updatedBy: session?.user?.id || null,
    },
    create: {
      key,
      value,
      updatedBy: session?.user?.id || null,
    },
  });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  await requireAdmin();
  const settings = await prisma.settings.findMany();
  return settings.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    },
    {} as Record<string, string>
  );
}

export async function updateSettings(
  settings: Record<string, string>
): Promise<void> {
  await requireAdmin();
  const session = await auth();

  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: {
          value,
          updatedBy: session?.user?.id || null,
        },
        create: {
          key,
          value,
          updatedBy: session?.user?.id || null,
        },
      })
    )
  );
}

