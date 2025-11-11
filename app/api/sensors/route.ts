import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const sensors = await prisma.sensor.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(sensors)
  } catch (error) {
    console.error("Error fetching sensors:", error)
    return NextResponse.json(
      { error: "Failed to fetch sensors" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, location, type, status = "active" } = body

    if (!name || !location || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const sensor = await prisma.sensor.create({
      data: {
        name,
        location,
        type,
        status,
      },
    })

    return NextResponse.json(sensor, { status: 201 })
  } catch (error) {
    console.error("Error creating sensor:", error)
    return NextResponse.json(
      { error: "Failed to create sensor" },
      { status: 500 }
    )
  }
}

