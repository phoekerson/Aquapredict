"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Activity, BrainCircuit } from "lucide-react"

const items = [
  {
    icon: Activity,
    title: "Capteurs IoT",
    desc: "Collecte continue des données d’eaux usées sur le terrain.",
  },
  {
    icon: BrainCircuit,
    title: "IA Gemini",
    desc: "Analyses prédictives, résumés et visualisations automatiques.",
  },
  {
    icon: ShieldCheck,
    title: "Alertes précoces",
    desc: "Détection de signaux anormaux et notifications immédiates.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


