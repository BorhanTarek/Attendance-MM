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

    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID is required" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        registeredDeviceId: deviceId
      },
    });

    return NextResponse.json({ success: true, message: "Device registered successfully!" });
  } catch (error) {
    console.error("Biometric registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
