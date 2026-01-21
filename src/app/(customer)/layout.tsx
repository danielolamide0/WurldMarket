import { CustomerLayout } from '@/components/layout/CustomerLayout'

export default function CustomerRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CustomerLayout>{children}</CustomerLayout>
}
