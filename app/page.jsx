import dynamic from 'next/dynamic'
import styles from './page.module.css'

const Game = dynamic(() => import('../components/Game'), { ssr: false })

export default function Page() {
  return (
    <main className={styles.page}>
      <Game />
    </main>
  )
}
