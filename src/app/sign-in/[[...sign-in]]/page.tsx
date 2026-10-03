import Link from 'next/link'
import type { Metadata } from 'next'
import { SignInClient } from './SignInClient'

export const metadata: Metadata = { title: 'サインイン' }

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Project Tracker</h1>
          <p className="mt-1 text-sm text-gray-500">アカウントにサインイン</p>
        </div>

        <SignInClient />

        <p className="mt-6 text-center text-sm text-gray-500">
          アカウントをお持ちでない方は{' '}
          <Link href="/sign-up" className="font-medium text-indigo-600 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
