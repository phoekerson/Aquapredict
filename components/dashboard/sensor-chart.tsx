"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { SensorReading } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale/fr"

interface SensorChartProps {
  readings: SensorReading[]
  dataKey: "bacterialCount" | "viralLoad" | "ph" | "temperature"
  title: string
  color?: string
}

export function SensorChart({
  readings,
  dataKey,
  title,
  color = "#8884d8",
}: SensorChartProps) {
  const chartData = readings.map((reading) => ({
    time: format(new Date(reading.timestamp), "HH:mm", { locale: fr }),
    date: format(new Date(reading.timestamp), "dd/MM", { locale: fr }),
    value: reading[dataKey] || 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  const index = chartData.findIndex((d) => d.time === value)
                  return chartData[index]?.date + " " + value
                }
                return value
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4 }}
              name={title}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

