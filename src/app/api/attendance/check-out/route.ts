import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the latest successful check-in without a check-out time for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const latestLog = await prisma.attendanceLog.findFirst({
      where: {
        userId: session.user.id,
        status: "SUCCESS",
        checkInTime: {
          gte: startOfDay,
        },
        checkOutTime: null,
      },
      orderBy: {
        checkInTime: "desc",
      },
    });

    if (!latestLog) {
      return NextResponse.json({ error: "No active check-in found for today." }, { status: 400 });
    }

    // Update the log with check-out time
    await prisma.attendanceLog.update({
      where: { id: latestLog.id },
      data: {
        checkOutTime: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Check-out successful!" 
    });

  } catch (error) {
    console.error("Check-out error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
