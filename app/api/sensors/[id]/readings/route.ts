import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "100")
    const hours = parseInt(searchParams.get("hours") || "24")

    const since = new Date()
    since.setHours(since.getHours() - hours)

    const readings = await prisma.sensorReading.findMany({
      where: {
        sensorId: id,
        timestamp: {
          gte: since,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    })

    return NextResponse.json(readings)
  } catch (error) {
    console.error("Error fetching readings:", error)
    return NextResponse.json(
      { error: "Failed to fetch readings" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      temperature,
      ph,
      turbidity,
      dissolvedOxygen,
      conductivity,
      bacterialCount,
      viralLoad,
      metadata,
    } = body

    const reading = await prisma.sensorReading.create({
      data: {
        sensorId: id,
        temperature,
        ph,
        turbidity,
        dissolvedOxygen,
        conductivity,
        bacterialCount,
        viralLoad,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return NextResponse.json(reading, { status: 201 })
  } catch (error) {
    console.error("Error creating reading:", error)
    return NextResponse.json(
      { error: "Failed to create reading" },
      { status: 500 }
    )
  }
}

