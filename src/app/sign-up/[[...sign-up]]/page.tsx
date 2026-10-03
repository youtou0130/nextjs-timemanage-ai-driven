import Link from 'next/link'
import type { Metadata } from 'next'
import { SignUpClient } from './SignUpClient'

export const metadata: Metadata = { title: '新規登録' }

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Project Tracker</h1>
          <p className="mt-1 text-sm text-gray-500">無料アカウントを作成</p>
        </div>

        <SignUpClient />

        <p className="mt-6 text-center text-sm text-gray-500">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/sign-in" className="font-medium text-indigo-600 hover:underline">
            サインイン
          </Link>
        </p>
      </div>
    </div>
  )
}
