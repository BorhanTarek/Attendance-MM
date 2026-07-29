"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSchedule(formData: FormData) {
  const userId = formData.get("userId") as string;
  const dateStr = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  if (!userId || !dateStr || !startTime || !endTime) {
    throw new Error("Missing fields");
  }

  const date = new Date(dateStr);

  await prisma.schedule.upsert({
    where: {
      userId_date: {
        userId,
        date
      }
    },
    update: {
      startTime,
      endTime
    },
    create: {
      userId,
      date,
      startTime,
      endTime
    }
  });

  revalidatePath("/admin/schedules");
}

export async function deleteSchedule(id: string) {
  await prisma.schedule.delete({
    where: { id },
  });
  revalidatePath("/admin/schedules");
}

export async function bulkUploadSchedules(data: any[]) {
  // data is expected to be an array of objects: 
  // { EmployeeEmail: "...", Date: "YYYY-MM-DD", StartTime: "09:00", EndTime: "17:00" }

  let successCount = 0;
  let failCount = 0;

  for (const row of data) {
    if (!row.EmployeeEmail || !row.Date || !row.StartTime || !row.EndTime) {
      failCount++;
      continue;
    }

    const user = await prisma.user.findUnique({
      where: { email: row.EmployeeEmail.trim() }
    });

    if (!user) {
      failCount++;
      continue;
    }

    try {
      const date = new Date(row.Date);
      await prisma.schedule.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date
          }
        },
        update: {
          startTime: row.StartTime,
          endTime: row.EndTime
        },
        create: {
          userId: user.id,
          date,
          startTime: row.StartTime,
          endTime: row.EndTime
        }
      });
      successCount++;
    } catch (e) {
      failCount++;
    }
  }

  revalidatePath("/admin/schedules");
  return { successCount, failCount };
}
