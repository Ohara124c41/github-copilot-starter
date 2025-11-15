import '../styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  title: 'Sudoku - Copilot Starter',
  description: 'Sudoku game migrated to Next.js (App Router)'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable}`}>
        {children}
      </body>
    </html>
  )
}
