"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react"
import { RiskLevel } from "@/types"

interface RiskIndicatorProps {
  riskLevel: RiskLevel
  confidence: number
  summary: string
}

const riskConfig: Record<
  RiskLevel,
  { label: string; color: string; icon: typeof AlertTriangle }
> = {
  low: {
    label: "Faible",
    color: "bg-green-500",
    icon: CheckCircle2,
  },
  medium: {
    label: "Modéré",
    color: "bg-yellow-500",
    icon: Info,
  },
  high: {
    label: "Élevé",
    color: "bg-orange-500",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critique",
    color: "bg-red-500",
    icon: XCircle,
  },
}

export function RiskIndicator({
  riskLevel,
  confidence,
  summary,
}: RiskIndicatorProps) {
  const config = riskConfig[riskLevel]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.color.replace("bg-", "text-")}`} />
            Niveau de risque actuel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`text-lg px-4 py-2 ${config.color.replace("bg-", "border-")}`}
            >
              {config.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Confiance: {Math.round(confidence * 100)}%
            </span>
          </div>
          <p className="text-sm leading-relaxed">{summary}</p>
          <div className="w-full bg-secondary rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${config.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

