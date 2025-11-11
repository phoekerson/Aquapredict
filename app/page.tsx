"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RiskIndicator } from "@/components/dashboard/risk-indicator"
import { SensorChart } from "@/components/dashboard/sensor-chart"
import { AlertsList } from "@/components/dashboard/alerts-list"
import { SensorsMap } from "@/components/dashboard/sensors-map"
import {
  Activity,
  AlertTriangle,
  Database,
  TrendingUp,
  Waves,
} from "lucide-react"
import { DashboardStats, Sensor, SensorReading, Alert, Analysis } from "@/types"
import {
  mockSensors,
  mockAlerts,
  mockAnalysis,
  mockStats,
  getMockReadings,
} from "@/lib/mock-data"
import { AIAnalysisTab } from "@/components/ai/ai-analysis-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Brain } from "lucide-react"

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [latestAnalysis, setLatestAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, sensorsRes, alertsRes, analysisRes] = await Promise.all([
          fetch("/api/stats").catch(() => null),
          fetch("/api/sensors").catch(() => null),
          fetch("/api/alerts?acknowledged=false&limit=5").catch(() => null),
          fetch("/api/analysis?limit=1").catch(() => null),
        ])

        // Vérifier si les API fonctionnent
        const apiAvailable =
          statsRes?.ok && sensorsRes?.ok && alertsRes?.ok && analysisRes?.ok

        if (apiAvailable) {
          // Utiliser les données de l'API
          const [statsData, sensorsData, alertsData, analysisData] =
            await Promise.all([
              statsRes.json(),
              sensorsRes.json(),
              alertsRes.json(),
              analysisRes.json(),
            ])

          const hasData =
            (Array.isArray(sensorsData) && sensorsData.length > 0) ||
            (Array.isArray(alertsData) && alertsData.length > 0) ||
            (Array.isArray(analysisData) && analysisData.length > 0)

          if (hasData) {
            setStats(statsData)
            setSensors(Array.isArray(sensorsData) ? sensorsData : [])
            setAlerts(Array.isArray(alertsData) ? alertsData : [])
            setLatestAnalysis(
              Array.isArray(analysisData) && analysisData.length > 0
                ? analysisData[0]
                : null
            )

            // Récupérer les lectures du premier capteur actif
            const sensorsArray = Array.isArray(sensorsData) ? sensorsData : []
            const activeSensor = sensorsArray.find(
              (s: Sensor) => s.status === "active"
            )
            if (activeSensor) {
              try {
                const readingsRes = await fetch(
                  `/api/sensors/${activeSensor.id}/readings?hours=24&limit=50`
                )
                if (readingsRes.ok) {
                  const readingsData = await readingsRes.json()
                  setReadings(Array.isArray(readingsData) ? readingsData : [])
                }
              } catch (error) {
                console.error("Error fetching readings:", error)
              }
            }
            setUseMockData(false)
            return
          }
        }

        // Utiliser les données fictives si les API ne sont pas disponibles
        setUseMockData(true)
        setStats(mockStats)
        setSensors(mockSensors)
        setAlerts(mockAlerts)
        setLatestAnalysis(mockAnalysis)

        // Récupérer les lectures fictives du premier capteur actif
        const activeSensor = mockSensors.find((s) => s.status === "active")
        if (activeSensor) {
          setReadings(getMockReadings(activeSensor.id, 24))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        // En cas d'erreur, utiliser les données fictives
        setUseMockData(true)
        setStats(mockStats)
        setSensors(mockSensors)
        setAlerts(mockAlerts)
        setLatestAnalysis(mockAnalysis)

        const activeSensor = mockSensors.find((s) => s.status === "active")
        if (activeSensor) {
          setReadings(getMockReadings(activeSensor.id, 24))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                AquaPredict
              </h1>
              <p className="text-muted-foreground">
                Surveillance en temps réel des eaux usées pour la détection précoce
                d&apos;épidémies
              </p>
            </div>
            {useMockData && (
              <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
               
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Analyse IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 mt-6">

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Capteurs totaux"
            value={stats?.totalSensors || mockStats.totalSensors}
            description={`${stats?.activeSensors || mockStats.activeSensors} actifs`}
            icon={Activity}
          />
          <StatsCard
            title="Lectures totales"
            value={stats?.totalReadings || mockStats.totalReadings}
            description="Données collectées"
            icon={Database}
          />
          <StatsCard
            title="Niveau de risque"
            value={
              (stats?.currentRiskLevel || mockStats.currentRiskLevel) === "critical"
                ? "Critique"
                : (stats?.currentRiskLevel || mockStats.currentRiskLevel) === "high"
                ? "Élevé"
                : (stats?.currentRiskLevel || mockStats.currentRiskLevel) === "medium"
                ? "Modéré"
                : "Faible"
            }
            description="État actuel"
            icon={AlertTriangle}
          />
          <StatsCard
            title="Alertes actives"
            value={stats?.activeAlerts || mockStats.activeAlerts}
            description="Nécessitent une attention"
            icon={TrendingUp}
          />
        </div>

        {/* Risk Indicator */}
        <RiskIndicator
          riskLevel={latestAnalysis?.riskLevel || mockAnalysis.riskLevel}
          confidence={latestAnalysis?.confidence || mockAnalysis.confidence}
          summary={latestAnalysis?.summary || mockAnalysis.summary}
        />

        {/* Charts and Alerts */}
        <div className="grid gap-6 md:grid-cols-2">
          {readings.length > 0 ? (
            <>
              <SensorChart
                readings={readings}
                dataKey="bacterialCount"
                title="Charge bactérienne"
                color="#ef4444"
              />
              <SensorChart
                readings={readings}
                dataKey="viralLoad"
                title="Charge virale"
                color="#f59e0b"
              />
            </>
          ) : (
            <>
              <SensorChart
                readings={getMockReadings(mockSensors[0]?.id || "sensor-1", 24)}
                dataKey="bacterialCount"
                title="Charge bactérienne"
                color="#ef4444"
              />
              <SensorChart
                readings={getMockReadings(mockSensors[0]?.id || "sensor-1", 24)}
                dataKey="viralLoad"
                title="Charge virale"
                color="#f59e0b"
              />
            </>
          )}
        </div>

        {/* Sensors and Alerts */}
        <div className="grid gap-6 md:grid-cols-2">
          <SensorsMap sensors={sensors.length > 0 ? sensors : mockSensors} />
          <AlertsList alerts={alerts.length > 0 ? alerts : mockAlerts} />
        </div>
          </TabsContent>

          <TabsContent value="ai-analysis" className="mt-6">
            <AIAnalysisTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
