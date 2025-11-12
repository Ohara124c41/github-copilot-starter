import dynamic from 'next/dynamic'

// Game is a client component; we dynamically import it with SSR disabled
const Game = dynamic(() => import('../components/Game'), { ssr: false })

export default function Page() {
  return (
    <main>
      <h1 className="udacity-blue">Sudoku</h1>
      <Game />
    </main>
  )
}
