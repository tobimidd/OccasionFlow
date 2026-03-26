import type { Metadata } from 'next'
import { Bodoni_Moda, Jost } from 'next/font/google'
import './globals.css'

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Occasion Flow — Never miss a moment that matters',
  description: 'Automated gift delivery triggered by your calendar. Never forget a birthday, anniversary, or special occasion again.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${jost.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
