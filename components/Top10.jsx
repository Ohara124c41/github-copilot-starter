'use client'

import styles from './Top10.module.css'

const join = (...classes) => classes.filter(Boolean).join(' ')

const formatTime = (seconds) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return '--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs.toString().padStart(2, '0')}s`
}

export default function Top10({ entries = [], className = '' }) {
  const containerClass = join(styles.container, className)
  const hasEntries = entries.length > 0

  return (
    <section className={containerClass} aria-label="Top 10 fastest Sudoku times">
      <h3 className={styles.title}>Leaderboard</h3>
      {hasEntries ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={styles.caption}>Fastest completion times stored locally on this device.</caption>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Player</th>
                <th scope="col">Time</th>
                <th scope="col">Level</th>
                <th scope="col">Hints</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={`${entry.name}-${entry.time}-${index}`}>
                  <td><span className={styles.badge}>{index + 1}</span></td>
                  <td>{entry.name}</td>
                  <td>{formatTime(entry.time)}</td>
                  <td>{entry.difficulty}</td>
                  <td>{entry.hints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.emptyState}>No recorded times yet. Beat the clock to claim your spot!</p>
      )}
    </section>
  )
}
