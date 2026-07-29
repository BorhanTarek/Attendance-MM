"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEmployee(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locationId = formData.get("locationId") as string;

  if (!name || !email || !password) {
    throw new Error("Missing required fields");
  }

  // We are storing plaintext here purely for demonstration purposes in this project
  // In a real app, you must hash this password (e.g., using bcrypt)
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: password,
      role: "EMPLOYEE",
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

  if (!name || !email) {
    throw new Error("Missing required fields");
  }

  const data: any = {
    name,
    email,
    assignedLocationId: locationId === "ALL" ? null : locationId,
  };

  if (password && password.trim() !== "") {
    data.passwordHash = password;
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
