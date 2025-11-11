import { Sensor, SensorReading, Alert, Analysis, DashboardStats } from "@/types"

// Données fictives pour les capteurs
export const mockSensors: Sensor[] = [
  {
    id: "sensor-1",
    name: "Capteur Eaux Usées - Centre-ville",
    location: "Station d'épuration Centre",
    type: "wastewater",
    status: "active",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sensor-2",
    name: "Capteur Eaux Usées - Nord",
    location: "Station d'épuration Nord",
    type: "wastewater",
    status: "active",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sensor-3",
    name: "Capteur Eaux Usées - Sud",
    location: "Station d'épuration Sud",
    type: "wastewater",
    status: "active",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sensor-4",
    name: "Capteur Eaux Usées - Est",
    location: "Station d'épuration Est",
    type: "wastewater",
    status: "maintenance",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Générer des lectures fictives pour les dernières 24 heures
export function generateMockReadings(sensorId: string): SensorReading[] {
  const readings: SensorReading[] = []
  const now = new Date()

  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hour = timestamp.getHours()

    // Variation des données selon l'heure (simulation réaliste)
    const baseBacterial = 1500 + Math.sin((hour / 24) * Math.PI * 2) * 500
    const baseViral = 80 + Math.sin((hour / 24) * Math.PI * 2) * 40

    readings.push({
      id: `reading-${sensorId}-${i}`,
      sensorId,
      timestamp: timestamp.toISOString(),
      temperature: 18 + Math.random() * 4 + Math.sin((hour / 24) * Math.PI * 2) * 2,
      ph: 6.5 + Math.random() * 1.5,
      turbidity: 10 + Math.random() * 20,
      dissolvedOxygen: 5 + Math.random() * 3,
      conductivity: 500 + Math.random() * 200,
      bacterialCount: Math.max(0, baseBacterial + (Math.random() - 0.5) * 1000),
      viralLoad: Math.max(0, baseViral + (Math.random() - 0.5) * 50),
    })
  }

  return readings
}

// Données fictives pour les alertes
export const mockAlerts: Alert[] = [
  {
    id: "alert-1",
    analysisId: "analysis-1",
    sensorId: "sensor-1",
    type: "warning",
    severity: "medium",
    title: "Augmentation de la charge bactérienne détectée",
    message:
      "Les capteurs de la station Centre ont détecté une augmentation de 15% de la charge bactérienne au cours des dernières 6 heures. Surveillance renforcée recommandée.",
    acknowledged: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-2",
    sensorId: "sensor-2",
    type: "info",
    severity: "low",
    title: "Maintenance programmée",
    message:
      "Une maintenance préventive est prévue pour le capteur Nord dans 48 heures.",
    acknowledged: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

// Données fictives pour les analyses
export const mockAnalysis: Analysis = {
  id: "analysis-1",
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date().toISOString(),
  sensorIds: ["sensor-1", "sensor-2", "sensor-3"],
  riskLevel: "low",
  confidence: 0.87,
  summary:
    "Les données des capteurs indiquent un niveau de risque faible. Les paramètres sont dans les normes attendues pour cette période de l'année. Aucune anomalie significative détectée. La charge bactérienne et virale restent stables avec des variations normales liées aux cycles quotidiens.",
  predictions: [
    {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      riskLevel: "low",
      confidence: 0.85,
    },
    {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      riskLevel: "low",
      confidence: 0.82,
    },
    {
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      riskLevel: "low",
      confidence: 0.80,
    },
    {
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      riskLevel: "medium",
      confidence: 0.75,
    },
    {
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      riskLevel: "medium",
      confidence: 0.72,
    },
    {
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      riskLevel: "low",
      confidence: 0.78,
    },
    {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      riskLevel: "low",
      confidence: 0.80,
    },
  ],
  avgBacterialCount: 2450,
  avgViralLoad: 115,
  trend: "stable",
  modelVersion: "gemini-1.5-flash",
  processingTime: 1250,
  createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
}

// Statistiques fictives
export const mockStats: DashboardStats = {
  totalSensors: 4,
  activeSensors: 3,
  totalReadings: 2847,
  currentRiskLevel: "low",
  activeAlerts: 2,
  lastAnalysisDate: new Date().toISOString(),
}

// Fonction pour obtenir les lectures d'un capteur
export function getMockReadings(sensorId: string, hours: number = 24): SensorReading[] {
  return generateMockReadings(sensorId).slice(-hours)
}

