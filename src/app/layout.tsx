import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'WurldBasket - Global Food Marketplace',
  description: 'Shop authentic international groceries from local stores in the UK',
  keywords: ['international food', 'grocery', 'world cuisine', 'uk delivery', 'ethnic supermarket', 'asian food', 'african food', 'caribbean food'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1E4D8C',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-white`}>
        <Providers>
          {children}
        </Providers>
        <Script id="agentcx-config" strategy="beforeInteractive">
          {`window.AGENTCX_CONFIG = {
            installationId: 'cx_aysop9j5nbvz_shàde',
            position: 'bottom-right',
            iconFrame: 'default'
          };`}
        </Script>
        <Script
          src="https://widget.agentcx.net/agentcx-widget.js?installationId=cx_aysop9j5nbvz_shàde"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
