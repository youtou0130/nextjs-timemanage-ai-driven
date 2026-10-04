import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { UserSettingContent } from '@/components/settings/UserSettingContent'

export const metadata: Metadata = { title: 'アカウント設定' }

export default async function UserSettingPage() {
  await auth.protect()
  return <UserSettingContent />
}
