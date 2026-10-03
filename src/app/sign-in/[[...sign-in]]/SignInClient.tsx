'use client'

import dynamic from 'next/dynamic'

const DynamicSignIn = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignIn),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-xl bg-gray-100" /> }
)

export function SignInClient() {
  return <DynamicSignIn />
}
