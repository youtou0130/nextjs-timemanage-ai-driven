'use client'

import { useAuth } from '@clerk/nextjs'
import { UpgradePrompt } from './UpgradePrompt'

interface Props {
  children: React.ReactNode
  plan?: string
  fallback?: React.ReactNode
}

/**
 * Clerk v7 (Core 3) では <Protect> が廃止されたため useAuth().has() で代替。
 * plan prop に Clerk Dashboard の Product slug を渡す（デフォルト: 'premium'）。
 */
export function PlanProtect({
  children,
  plan = 'premium',
  fallback,
}: Props) {
  const { has, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!has?.({ plan })) {
    return <>{fallback ?? <UpgradePrompt />}</>
  }

  return <>{children}</>
}
