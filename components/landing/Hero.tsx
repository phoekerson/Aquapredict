"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 text-center"
      >
        <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-foreground/70">
          Surveillance des eaux usées par l’IA
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-6xl">
          Détectez tôt. Agissez vite.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          AquaPredict transforme des données brutes en signaux d’alerte
          exploitables, grâce à des capteurs IoT et à l’IA générative.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="#ai">Analyser avec l’IA</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#dashboard">Voir le dashboard</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 opacity-10"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 0.8 }}
        aria-hidden
      >
        <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-primary blur-3xl md:h-96 md:w-96" />
        <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full bg-green-300 blur-3xl" />
      </motion.div>
    </section>
  )
}


