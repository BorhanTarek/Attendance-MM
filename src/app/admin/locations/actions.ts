"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLocation(formData: FormData) {
  const name = formData.get("name") as string;
  const latitude = parseFloat(formData.get("latitude") as string);
  const longitude = parseFloat(formData.get("longitude") as string);
  const radius = parseFloat(formData.get("radius") as string);

  if (!name || isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
    throw new Error("Invalid input data");
  }

  await prisma.location.create({
    data: {
      name,
      latitude,
      longitude,
      radius,
    },
  });

  revalidatePath("/admin/locations");
}
export async function updateLocation(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const latitude = parseFloat(formData.get("latitude") as string);
  const longitude = parseFloat(formData.get("longitude") as string);
  const radius = parseFloat(formData.get("radius") as string);

  if (!name || isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
    throw new Error("Invalid input data");
  }

  await prisma.location.update({
    where: { id },
    data: { name, latitude, longitude, radius },
  });

  revalidatePath("/admin/locations");
}

export async function deleteLocation(id: string) {
  await prisma.location.delete({
    where: { id },
  });
  revalidatePath("/admin/locations");
}
