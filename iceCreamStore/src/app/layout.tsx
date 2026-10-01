import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ice Cream Store',
  description: 'Order your favourite ice cream or book a table.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
