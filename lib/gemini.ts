import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function analyzeWastewaterData(data: {
  sensorReadings: Array<{
    timestamp: string
    bacterialCount?: number
    viralLoad?: number
    ph?: number
    temperature?: number
    turbidity?: number
  }>
  location: string
  timeRange: { start: string; end: string }
}) {
  const candidateModels = [
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ] as const

  const prompt = `Tu es un expert en épidémiologie et analyse de données de santé publique. 
Analyse les données suivantes d'eaux usées collectées par des capteurs IoT et fournis une évaluation des risques d'épidémie.

Données:
- Localisation: ${data.location}
- Période: ${data.timeRange.start} à ${data.timeRange.end}
- Nombre de lectures: ${data.sensorReadings.length}

Lectures des capteurs:
${JSON.stringify(data.sensorReadings.slice(-20), null, 2)}

Fournis une analyse structurée en JSON avec:
1. riskLevel: "low" | "medium" | "high" | "critical"
2. confidence: nombre entre 0 et 1
3. summary: résumé en français (2-3 phrases) de l'état actuel
4. predictions: prédictions pour les 7 prochains jours (array de {date, riskLevel, confidence})
5. recommendations: array de recommandations concises
6. trend: "increasing" | "decreasing" | "stable"

Réponds UNIQUEMENT avec du JSON valide, sans markdown.`

  try {
    let text = ''
    let lastError: unknown = null

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const response = await result.response
        text = response.text()
        break
      } catch (err) {
        lastError = err
        continue
      }
    }

    if (!text) {
      throw lastError ?? new Error("Aucun modèle Gemini compatible n'a répondu.")
    }
    
    // Nettoyer le texte pour extraire le JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const analysis = JSON.parse(jsonMatch[0])
    
    return {
      riskLevel: analysis.riskLevel || 'low',
      confidence: Math.max(0, Math.min(1, analysis.confidence || 0.5)),
      summary: analysis.summary || 'Analyse en cours...',
      predictions: analysis.predictions || [],
      recommendations: analysis.recommendations || [],
      trend: analysis.trend || 'stable',
    }
  } catch (error) {
    console.error('Error analyzing data with Gemini:', error)
    throw error
  }
}

export async function generateAlertSummary(alert: {
  type: string
  severity: string
  title: string
  message: string
}) {
  const candidateModels = [
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ] as const

  const prompt = `Génère un résumé concis et actionnable pour cette alerte de santé publique:

Type: ${alert.type}
Sévérité: ${alert.severity}
Titre: ${alert.title}
Message: ${alert.message}

Fournis un résumé en 2-3 phrases en français qui explique la situation et les actions recommandées.`

  try {
    let text = ''
    let lastError: unknown = null

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const response = await result.response
        text = response.text()
        break
      } catch (err) {
        lastError = err
        continue
      }
    }

    if (!text) {
      throw lastError ?? new Error("Aucun modèle Gemini compatible n'a répondu.")
    }

    return text
  } catch (error) {
    console.error('Error generating alert summary:', error)
    return alert.message
  }
}

