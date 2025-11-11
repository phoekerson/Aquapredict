import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Créer des capteurs
  const sensor1 = await prisma.sensor.create({
    data: {
      name: 'Capteur Eaux Usées - Centre-ville',
      location: 'Station d\'épuration Centre',
      type: 'wastewater',
      status: 'active',
    },
  })

  const sensor2 = await prisma.sensor.create({
    data: {
      name: 'Capteur Eaux Usées - Nord',
      location: 'Station d\'épuration Nord',
      type: 'wastewater',
      status: 'active',
    },
  })

  const sensor3 = await prisma.sensor.create({
    data: {
      name: 'Capteur Eaux Usées - Sud',
      location: 'Station d\'épuration Sud',
      type: 'wastewater',
      status: 'active',
    },
  })

  console.log('✅ Created 3 sensors')

  // Créer des lectures de démonstration pour les dernières 24 heures
  const now = new Date()
  const readings = []

  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    
    // Lecture pour sensor1
    readings.push(
      prisma.sensorReading.create({
        data: {
          sensorId: sensor1.id,
          timestamp,
          temperature: 18 + Math.random() * 4,
          ph: 6.5 + Math.random() * 1.5,
          turbidity: 10 + Math.random() * 20,
          dissolvedOxygen: 5 + Math.random() * 3,
          conductivity: 500 + Math.random() * 200,
          bacterialCount: 1000 + Math.random() * 5000,
          viralLoad: 50 + Math.random() * 200,
        },
      })
    )

    // Lecture pour sensor2
    readings.push(
      prisma.sensorReading.create({
        data: {
          sensorId: sensor2.id,
          timestamp,
          temperature: 17 + Math.random() * 5,
          ph: 6.8 + Math.random() * 1.2,
          turbidity: 12 + Math.random() * 18,
          dissolvedOxygen: 4.5 + Math.random() * 3.5,
          conductivity: 450 + Math.random() * 250,
          bacterialCount: 800 + Math.random() * 4000,
          viralLoad: 40 + Math.random() * 180,
        },
      })
    )

    // Lecture pour sensor3
    readings.push(
      prisma.sensorReading.create({
        data: {
          sensorId: sensor3.id,
          timestamp,
          temperature: 19 + Math.random() * 3,
          ph: 6.6 + Math.random() * 1.4,
          turbidity: 11 + Math.random() * 19,
          dissolvedOxygen: 5.5 + Math.random() * 2.5,
          conductivity: 520 + Math.random() * 180,
          bacterialCount: 1200 + Math.random() * 4500,
          viralLoad: 60 + Math.random() * 190,
        },
      })
    )
  }

  await Promise.all(readings)
  console.log('✅ Created 72 sensor readings (24h of data)')

  // Créer une analyse de démonstration
  const analysis = await prisma.analysis.create({
    data: {
      startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      endDate: now,
      sensorIds: JSON.stringify([sensor1.id, sensor2.id, sensor3.id]),
      riskLevel: 'low',
      confidence: 0.85,
      summary: 'Les données des capteurs indiquent un niveau de risque faible. Les paramètres sont dans les normes attendues pour cette période de l\'année. Aucune anomalie significative détectée.',
      predictions: JSON.stringify([
        { date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), riskLevel: 'low', confidence: 0.82 },
        { date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), riskLevel: 'low', confidence: 0.80 },
        { date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), riskLevel: 'low', confidence: 0.78 },
      ]),
      avgBacterialCount: 2500,
      avgViralLoad: 120,
      trend: 'stable',
      modelVersion: 'gemini-1.5-flash',
      processingTime: 1250,
    },
  })

  console.log('✅ Created 1 analysis')

  console.log('🎉 Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

