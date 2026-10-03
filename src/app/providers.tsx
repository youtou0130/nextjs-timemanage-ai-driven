'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { TimerProvider } from '@/contexts/TimerContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <TimerProvider>{children}</TimerProvider>
    </ClerkProvider>
  )
}
