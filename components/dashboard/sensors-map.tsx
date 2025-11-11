"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { MapPin, Activity, AlertCircle } from "lucide-react"
import { Sensor } from "@/types"

interface SensorsMapProps {
  sensors: Sensor[]
}

export function SensorsMap({ sensors }: SensorsMapProps) {
  const activeSensors = sensors.filter((s) => s.status === "active")
  const inactiveSensors = sensors.filter((s) => s.status !== "active")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Réseau de capteurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Capteurs actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {activeSensors.length}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Capteurs inactifs</p>
              <p className="text-2xl font-bold text-red-600">
                {inactiveSensors.length}
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sensors.map((sensor, index) => (
              <motion.div
                key={sensor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Activity
                    className={`h-4 w-4 ${
                      sensor.status === "active"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{sensor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sensor.location}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    sensor.status === "active" ? "default" : "secondary"
                  }
                >
                  {sensor.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

