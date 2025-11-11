import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [
      totalSensors,
      activeSensors,
      totalReadings,
      latestAnalysis,
      activeAlerts,
    ] = await Promise.all([
      prisma.sensor.count(),
      prisma.sensor.count({ where: { status: "active" } }),
      prisma.sensorReading.count(),
      prisma.analysis.findFirst({
        orderBy: { createdAt: "desc" },
      }),
      prisma.alert.count({
        where: { acknowledged: false },
      }),
    ])

    return NextResponse.json({
      totalSensors,
      activeSensors,
      totalReadings,
      currentRiskLevel: latestAnalysis?.riskLevel || "low",
      activeAlerts,
      lastAnalysisDate: latestAnalysis?.createdAt || null,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}

