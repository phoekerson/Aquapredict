import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { analyzeWastewaterData } from "@/lib/gemini"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10")

    const analyses = await prisma.analysis.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json(analyses)
  } catch (error) {
    console.error("Error fetching analyses:", error)
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    const body = await request.json()
    const { sensorIds, startDate, endDate } = body

    if (!sensorIds || !Array.isArray(sensorIds) || sensorIds.length === 0) {
      return NextResponse.json(
        { error: "sensorIds must be a non-empty array" },
        { status: 400 }
      )
    }

    // Récupérer les lectures des capteurs
    const readings = await prisma.sensorReading.findMany({
      where: {
        sensorId: { in: sensorIds },
        timestamp: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { timestamp: "asc" },
      include: {
        sensor: true,
      },
    })

    if (readings.length === 0) {
      return NextResponse.json(
        { error: "No readings found for the specified period" },
        { status: 404 }
      )
    }

    // Préparer les données pour l'analyse IA
    const location = readings[0]?.sensor?.location || "Unknown"
    const sensorReadings = readings.map((r) => ({
      timestamp: r.timestamp.toISOString(),
      bacterialCount: r.bacterialCount ?? undefined,
      viralLoad: r.viralLoad ?? undefined,
      ph: r.ph ?? undefined,
      temperature: r.temperature ?? undefined,
      turbidity: r.turbidity ?? undefined,
    }))

    // Analyser avec Gemini
    const aiAnalysis = await analyzeWastewaterData({
      sensorReadings,
      location,
      timeRange: {
        start: startDate,
        end: endDate,
      },
    })

    // Calculer les moyennes
    const avgBacterialCount =
      readings.reduce((sum, r) => sum + (r.bacterialCount || 0), 0) /
      readings.length
    const avgViralLoad =
      readings.reduce((sum, r) => sum + (r.viralLoad || 0), 0) / readings.length

    // Créer l'analyse dans la base de données
    const analysis = await prisma.analysis.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        sensorIds: JSON.stringify(sensorIds),
        riskLevel: aiAnalysis.riskLevel,
        confidence: aiAnalysis.confidence,
        summary: aiAnalysis.summary,
        predictions: JSON.stringify(aiAnalysis.predictions),
        avgBacterialCount,
        avgViralLoad,
        trend: aiAnalysis.trend,
        modelVersion: "gemini-1.5-flash",
        processingTime: Date.now() - startTime,
      },
    })

    // Créer des alertes si nécessaire
    if (aiAnalysis.riskLevel === "high" || aiAnalysis.riskLevel === "critical") {
      await prisma.alert.create({
        data: {
          analysisId: analysis.id,
          type: aiAnalysis.riskLevel === "critical" ? "critical" : "warning",
          severity: aiAnalysis.riskLevel,
          title: `Alerte ${aiAnalysis.riskLevel === "critical" ? "critique" : "élevée"} détectée`,
          message: aiAnalysis.summary,
        },
      })
    }

    return NextResponse.json(analysis, { status: 201 })
  } catch (error) {
    console.error("Error creating analysis:", error)
    return NextResponse.json(
      { error: "Failed to create analysis", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}