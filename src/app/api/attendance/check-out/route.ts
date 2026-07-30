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

    const body = await req.json().catch(() => ({}));
    const latitude = typeof body.latitude === 'number' ? body.latitude : null;
    const longitude = typeof body.longitude === 'number' ? body.longitude : null;
    const deviceId = body.deviceId;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { biometricRegistered: true, registeredDeviceId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Device binding validation
    if (user.biometricRegistered) {
      if (!deviceId || deviceId !== user.registeredDeviceId) {
        return NextResponse.json({ 
          error: "Unauthorized device. Please use your registered phone to check out." 
        }, { status: 403 });
      }
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
    const userAgent = req.headers.get("user-agent");
    const checkOutDevice = parseDevice(userAgent);
    const biometricVerified = body.biometricVerified === true;
    const photo = body.photo || null;

    await prisma.attendanceLog.update({
      where: { id: latestLog.id },
      data: {
        checkOutTime: new Date(),
        checkOutLat: latitude,
        checkOutLng: longitude,
        checkOutDevice,
        biometricVerified: latestLog.biometricVerified && biometricVerified,
        checkOutPhoto: photo,
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

function parseDevice(ua: string | null) {
  if (!ua) return "Unknown";
  const androidMatch = ua.match(/Android [^;]+; ([^)]+)\)/);
  if (androidMatch) {
    return `Android (${androidMatch[1].split(' Build')[0]})`;
  }
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Windows NT/i.test(ua)) return "Windows PC";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown Device";
}
