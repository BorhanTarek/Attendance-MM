"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createEmployee(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locationId = formData.get("locationId") as string;
  const role = (formData.get("role") as string) || "EMPLOYEE";

  if (!name || !email || !password) {
    throw new Error("Missing required fields");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as any,
      assignedLocationId: locationId === "ALL" ? null : locationId,
    },
  });

  revalidatePath("/admin/employees");
}

export async function updateEmployee(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locationId = formData.get("locationId") as string;
  const role = formData.get("role") as string;

  if (!name || !email) {
    throw new Error("Missing required fields");
  }

  const data: any = {
    name,
    email,
    role: role as any,
    assignedLocationId: locationId === "ALL" ? null : locationId,
  };

  if (password && password.trim() !== "") {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/employees");
}

export async function deleteEmployee(id: string) {
  await prisma.user.delete({
    where: { id },
  });
  revalidatePath("/admin/employees");
}

export async function resetDevice(id: string) {
  await prisma.user.update({
    where: { id },
    data: {
      biometricRegistered: false,
      registeredDeviceId: null,
    },
  });
  revalidatePath("/admin/employees");
}
