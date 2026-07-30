import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { calculateDistanceMeters } from "@/lib/haversine";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { latitude, longitude, biometricVerified, photo } = body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: "Invalid coordinates provided" }, { status: 400 });
    }

    // Get the user and their assigned location
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { assignedLocation: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let targetLocation = user.assignedLocation;

    // If no assigned location, they might be allowed at any location. Let's find the closest one.
    if (!targetLocation) {
      const allLocations = await prisma.location.findMany();
      if (allLocations.length === 0) {
         return NextResponse.json({ error: "No office locations configured in the system" }, { status: 400 });
      }
      
      let closestLoc = allLocations[0];
      let minDistance = calculateDistanceMeters(latitude, longitude, closestLoc.latitude, closestLoc.longitude);

      for (const loc of allLocations) {
        const dist = calculateDistanceMeters(latitude, longitude, loc.latitude, loc.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          closestLoc = loc;
        }
      }
      targetLocation = closestLoc;
    }

    const distance = calculateDistanceMeters(
      latitude, 
      longitude, 
      targetLocation.latitude, 
      targetLocation.longitude
    );

    const isWithinRadius = distance <= targetLocation.radius;
    const userAgent = req.headers.get("user-agent");
    const checkInDevice = parseDevice(userAgent);

    // Log the check-in regardless of success to keep track of out-of-bounds attempts
    await prisma.attendanceLog.create({
      data: {
        userId: user.id,
        locationId: targetLocation.id,
        distanceMeters: distance,
        status: isWithinRadius ? "SUCCESS" : "OUT_OF_BOUNDS",
        checkInLat: latitude,
        checkInLng: longitude,
        checkInDevice,
        biometricVerified: biometricVerified === true,
        checkInPhoto: photo || null,
      }
    });

    if (!isWithinRadius) {
      return NextResponse.json({ 
        error: `Check-in failed. You are ${Math.round(distance)} meters away from ${targetLocation.name}. Allowed radius is ${targetLocation.radius} meters.` 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Check-in successful at ${targetLocation.name}!` 
    });

  } catch (error) {
    console.error("Check-in error:", error);
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
