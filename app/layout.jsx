import '../styles/globals.css'

export const metadata = {
  title: 'Sudoku - Copilot Starter',
  description: 'Sudoku game migrated to Next.js (App Router)'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
