export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type AlertType = 'warning' | 'critical' | 'info'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type Trend = 'increasing' | 'decreasing' | 'stable'

export interface SensorReading {
  id: string
  sensorId: string
  timestamp: string
  temperature?: number
  ph?: number
  turbidity?: number
  dissolvedOxygen?: number
  conductivity?: number
  bacterialCount?: number
  viralLoad?: number
  metadata?: string
}

export interface Sensor {
  id: string
  name: string
  location: string
  type: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Analysis {
  id: string
  startDate: string
  endDate: string
  sensorIds: string[]
  riskLevel: RiskLevel
  confidence: number
  summary: string
  predictions?: Prediction[]
  avgBacterialCount?: number
  avgViralLoad?: number
  trend?: Trend
  modelVersion?: string
  processingTime?: number
  createdAt: string
  updatedAt: string
}

export interface Prediction {
  date: string
  riskLevel: RiskLevel
  confidence: number
}

export interface Alert {
  id: string
  analysisId?: string
  sensorId?: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  acknowledged: boolean
  acknowledgedAt?: string
  createdAt: string
}

export interface DashboardStats {
  totalSensors: number
  activeSensors: number
  totalReadings: number
  currentRiskLevel: RiskLevel
  activeAlerts: number
  lastAnalysisDate?: string
}

