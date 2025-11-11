"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { AlertTriangle, Info, XCircle } from "lucide-react"
import { Alert as AlertType } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"

interface AlertsListProps {
  alerts: AlertType[]
}

const alertIcons = {
  warning: AlertTriangle,
  critical: XCircle,
  info: Info,
}

const alertColors = {
  low: "text-blue-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  critical: "text-red-600",
}

export function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucune alerte active
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertes actives ({alerts.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = alertIcons[alert.type]
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Alert variant={alert.severity === "critical" ? "destructive" : "default"}>
                <Icon className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.title}</span>
                  <Badge variant="outline" className={alertColors[alert.severity]}>
                    {alert.severity}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  {alert.message}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(alert.createdAt), "PPp", { locale: fr })}
                  </p>
                </AlertDescription>
              </Alert>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}

