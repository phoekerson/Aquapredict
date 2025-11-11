"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BarChart3, Table, TrendingUp, PieChart as PieChartIcon } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface AnalysisResultsProps {
  analysis: {
    summary?: string
    charts?: Array<{
      type: "bar" | "line" | "pie"
      title: string
      data: any[]
      xKey?: string
      yKey?: string
      dataKey?: string
    }>
    tables?: Array<{
      title: string
      headers: string[]
      rows: any[][]
    }>
    insights?: string[]
  }
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"]

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  if (!analysis || (!analysis.charts && !analysis.tables && !analysis.summary)) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Résumé */}
      {analysis.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Résumé de l'analyse</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {analysis.summary}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Graphiques */}
      {analysis.charts && analysis.charts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {analysis.charts.map((chart, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {chart.type === "bar" && <BarChart3 className="h-5 w-5" />}
                    {chart.type === "line" && <TrendingUp className="h-5 w-5" />}
                    {chart.type === "pie" && <PieChartIcon className="h-5 w-5" />}
                    {chart.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    {chart.type === "bar" && (
                      <BarChart data={chart.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={chart.xKey || "name"} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey={chart.yKey || "value"}
                          fill="#8884d8"
                        />
                      </BarChart>
                    )}
                    {chart.type === "line" && (
                      <LineChart data={chart.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={chart.xKey || "name"} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey={chart.yKey || "value"}
                          stroke="#8884d8"
                          strokeWidth={2}
                        />
                      </LineChart>
                    )}
                    {chart.type === "pie" && (
                      <PieChart>
                        <Pie
                          data={chart.data}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey={chart.dataKey || "value"}
                        >
                          {chart.data.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tableaux */}
      {analysis.tables && analysis.tables.length > 0 && (
        <div className="space-y-6">
          {analysis.tables.map((table, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="h-5 w-5" />
                    {table.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          {table.headers.map((header, i) => (
                            <th
                              key={i}
                              className="text-left p-3 font-semibold bg-muted/50"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            {row.map((cell, j) => (
                              <td key={j} className="p-3">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Insights */}
      {analysis.insights && analysis.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Insights clés</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

