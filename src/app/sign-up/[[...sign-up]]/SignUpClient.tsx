'use client'

import dynamic from 'next/dynamic'

const DynamicSignUp = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignUp),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-xl bg-gray-100" /> }
)

export function SignUpClient() {
  return <DynamicSignUp />
}
