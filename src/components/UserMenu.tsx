'use client'

import { useAuth, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export function UserMenu() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return null

  return isSignedIn ? (
    <UserButton />
  ) : (
    <div className="flex items-center gap-3">
      <Link
        href="/sign-in"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        サインイン
      </Link>
      <Link
        href="/sign-up"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        無料で始める
      </Link>
    </div>
  )
}
