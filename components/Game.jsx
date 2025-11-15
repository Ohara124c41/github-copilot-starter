'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import SudokuGame from '../utils/sudoku'
import Leaderboard from '../utils/leaderboard'
import Top10 from './Top10'
import styles from './Game.module.css'

const DEFAULT_DIFFICULTY = 'Medium'
const DIFFICULTY_CLUES = { Easy: 42, Medium: 35, Hard: 28 }

const join = (...classes) => classes.filter(Boolean).join(' ')
const difficultyToClues = (level) => DIFFICULTY_CLUES[level] ?? DIFFICULTY_CLUES[DEFAULT_DIFFICULTY]

const findFirstEditableCell = (grid) => {
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < (grid[r] || []).length; c += 1) {
      if (grid[r][c] === 0) {
        return { r, c }
      }
    }
  }
  return { r: 0, c: 0 }
}

export default function Game() {
  const sudokuRef = useRef(null)
  const leaderboardRef = useRef(null)
  const difficultyRef = useRef(DEFAULT_DIFFICULTY)

  const [board, setBoard] = useState([])
  const [solution, setSolution] = useState([])
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY)
  const [message, setMessage] = useState('')
  const [messageVariant, setMessageVariant] = useState('info')
  const [selected, setSelected] = useState(null)
  const [topScores, setTopScores] = useState([])
  const [conflictCells, setConflictCells] = useState(() => new Set())
  const [incorrectCells, setIncorrectCells] = useState(() => new Set())
  const [hasWon, setHasWon] = useState(false)
  const [theme, setTheme] = useState('light')
  const [hintsUsed, setHintsUsed] = useState(0)

  const showMessage = useCallback((text, variant = 'info') => {
    setMessage(text)
    setMessageVariant(variant)
  }, [])

  const syncDifficulty = useCallback((level) => {
    difficultyRef.current = level
    setDifficulty(level)
  }, [])

  const focusCell = useCallback((r, c) => {
    if (typeof document === 'undefined') return
    const target = document.getElementById(`cell-${r}-${c}`)
    if (target) target.focus()
  }, [])

  const computeConflicts = useCallback((candidateBoard) => {
    const game = sudokuRef.current
    if (!game) return new Set()
    const conflicts = new Set()
    for (let r = 0; r < candidateBoard.length; r += 1) {
      for (let c = 0; c < (candidateBoard[r] || []).length; c += 1) {
        const value = candidateBoard[r][c]
        if (!value) continue
        const duplicates = game.getConflicts(candidateBoard, r, c, value)
        if (duplicates.length) {
          conflicts.add(`${r},${c}`)
          duplicates.forEach(([rr, cc]) => conflicts.add(`${rr},${cc}`))
        }
      }
    }
    return conflicts
  }, [])

  const handleWin = useCallback(() => {
    const game = sudokuRef.current
    const leaderboard = leaderboardRef.current
    if (!game || !leaderboard || hasWon) return
    setHasWon(true)
    const elapsed = game.stopTimer()
    showMessage('Puzzle solved! Great job.', 'success')
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        window.alert('Congratulations! You solved the puzzle.')
      }, 50)
    }
    if (elapsed && leaderboard.qualifies(elapsed)) {
      const providedName = typeof window !== 'undefined' ? window.prompt('New Top 10 time! Enter your name:', 'Anonymous') : 'Anonymous'
      leaderboard.add({
        name: (providedName || 'Anonymous').trim() || 'Anonymous',
        time: elapsed,
        difficulty: difficultyRef.current,
        hints: game.hintsUsed
      })
    }
    setTopScores(leaderboard.getAll())
  }, [hasWon, showMessage])

  const checkForCompletion = useCallback((candidateBoard) => {
    const game = sudokuRef.current
    if (!game || hasWon) return
    const filled = candidateBoard.every((row) => row.every((cell) => cell !== 0))
    if (!filled) return
    if (game.checkAgainstSolution(candidateBoard, solution)) {
      handleWin()
    }
  }, [handleWin, hasWon, solution])

  const applyBoardChange = useCallback((nextBoard) => {
    setBoard(nextBoard)
    const conflictSet = computeConflicts(nextBoard)
    setConflictCells(conflictSet)
    setIncorrectCells((prev) => {
      if (prev.size === 0) return prev
      const stillWrong = new Set()
      prev.forEach((key) => {
        const [r, c] = key.split(',').map(Number)
        if (solution[r] && solution[r][c] !== nextBoard[r][c]) {
          stillWrong.add(key)
        }
      })
      return stillWrong
    })
    checkForCompletion(nextBoard)
  }, [checkForCompletion, computeConflicts, solution])

  const startNewGame = useCallback((level) => {
    const game = sudokuRef.current
    if (!game) return
    const activeLevel = level || difficultyRef.current
    const clues = difficultyToClues(activeLevel)
    try {
      const { board: nextBoard, solution: solvedBoard } = game.generatePuzzle(clues)
      syncDifficulty(activeLevel)
      setSolution(solvedBoard)
      setBoard(nextBoard)
      setConflictCells(new Set())
      setIncorrectCells(new Set())
      setHasWon(false)
      setHintsUsed(0)
      showMessage('New puzzle is ready. Start solving!')
      game.startTimer()
      const firstEditable = findFirstEditableCell(nextBoard)
      setSelected(firstEditable)
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => focusCell(firstEditable.r, firstEditable.c))
      }
    } catch (error) {
      console.error('Failed to generate puzzle', error)
      showMessage('Unable to create a new puzzle right now. Please try again.', 'warning')
    }
  }, [focusCell, showMessage, syncDifficulty])

  useEffect(() => {
    const game = new SudokuGame()
    const leaderboard = new Leaderboard()
    sudokuRef.current = game
    leaderboardRef.current = leaderboard
    setTopScores(leaderboard.getAll())
    const savedTheme = typeof window !== 'undefined' ? window.localStorage.getItem('sudoku_theme') : null
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
      const preferred = savedTheme || (prefersDark.matches ? 'dark' : 'light')
      setTheme(preferred)
    }
    startNewGame(DEFAULT_DIFFICULTY)
    if (typeof window !== 'undefined') {
      window.clearLeaderboard = () => {
        leaderboard.clear()
        setTopScores([])
      }
      window.getLeaderboard = () => leaderboard.getAll()
    }
  }, [startNewGame])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = theme
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sudoku_theme', theme)
    }
  }, [theme])

  const handleInput = (r, c, rawValue) => {
    const game = sudokuRef.current
    if (!game || hasWon || game.isPrefilled(r, c) || game.isHinted(r, c)) return
    const sanitized = rawValue.replace(/[^1-9]/g, '')
    const nextValue = sanitized ? parseInt(sanitized[sanitized.length - 1], 10) : 0
    if (board[r][c] === nextValue) return
    const nextBoard = board.map((row, rowIndex) =>
      rowIndex === r ? row.map((cell, colIndex) => (colIndex === c ? nextValue : cell)) : row.slice()
    )
    showMessage('')
    applyBoardChange(nextBoard)
    setSelected({ r, c })
  }

  const handleKeyDown = (event, r, c) => {
    const key = event.key
    const moveTo = (nextRow, nextCol) => {
      const boundedRow = Math.min(Math.max(nextRow, 0), 8)
      const boundedCol = Math.min(Math.max(nextCol, 0), 8)
      setSelected({ r: boundedRow, c: boundedCol })
      focusCell(boundedRow, boundedCol)
    }
    if (key === 'ArrowUp') { event.preventDefault(); moveTo(r - 1, c); return }
    if (key === 'ArrowDown') { event.preventDefault(); moveTo(r + 1, c); return }
    if (key === 'ArrowLeft') { event.preventDefault(); moveTo(r, c - 1); return }
    if (key === 'ArrowRight') { event.preventDefault(); moveTo(r, c + 1); return }
    if (key === 'Backspace' || key === 'Delete') { event.preventDefault(); handleInput(r, c, ''); return }
    if (key === 'Enter') { event.preventDefault(); handleCheck(); return }
    if (key === 'h' || key === 'H') { event.preventDefault(); handleHint(); return }
    if (/^[1-9]$/.test(key)) {
      event.preventDefault()
      handleInput(r, c, key)
      moveTo(r, c + 1)
    }
  }

  const handleHint = () => {
    const game = sudokuRef.current
    if (!game || hasWon) return
    try {
      const result = game.giveHint(board, solution)
      if (!result) {
        showMessage('No hints available. The board is complete.', 'warning')
        return
      }
      applyBoardChange(result.board)
      setSelected({ r: result.r, c: result.c })
      setHintsUsed(game.hintsUsed)
      showMessage('Hint revealed. Keep going!')
    } catch (error) {
      console.error('Failed to provide hint', error)
      showMessage('Unable to provide a hint right now. Please try again.', 'warning')
    }
  }

  const handleCheck = () => {
    const game = sudokuRef.current
    if (!game) return
    if (game.checkAgainstSolution(board, solution)) {
      setIncorrectCells(new Set())
      handleWin()
      return
    }
    const incorrect = new Set()
    for (let r = 0; r < board.length; r += 1) {
      for (let c = 0; c < (board[r] || []).length; c += 1) {
        if (board[r][c] && board[r][c] !== solution[r][c]) {
          incorrect.add(`${r},${c}`)
        }
      }
    }
    setIncorrectCells(incorrect)
    showMessage('Highlighted cells need attention.', 'warning')
  }

  const handleDifficultyChange = (event) => {
    startNewGame(event.target.value)
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const boardReady = board.length === 9
  const hasEmptyCells = board.some((row) => row.some((cell) => cell === 0))
  const selectedValue = selected && board[selected.r] ? board[selected.r][selected.c] : 0
  const messageToShow = message || 'You will see instant feedback for illegal moves.'
  const messageTone = message ? messageVariant : 'info'
  const themeButtonLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <div className={styles.game}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Sudoku Studio</h1>
        <p className={styles.heroSubtitle}>Sharpen your logic with accessible, real-time validations, a dark mode, and a local leaderboard.</p>
      </section>

      <div className={styles.panelLayout}>
        <section className={join(styles.panel, styles.boardCard)}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarRow}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel} htmlFor="difficulty-select">Difficulty</label>
                <select
                  id="difficulty-select"
                  aria-label="Select Sudoku difficulty"
                  value={difficulty}
                  onChange={handleDifficultyChange}
                  className={styles.select}
                >
                  {Object.keys(DIFFICULTY_CLUES).map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className={join(styles.button, styles.themeToggle)}
                onClick={toggleTheme}
                aria-pressed={theme === 'dark'}
                aria-label={themeButtonLabel}
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
            <div className={styles.toolbarRow}>
              <button type="button" className={styles.button} onClick={() => startNewGame()}>New Game</button>
              <button
                type="button"
                className={styles.button}
                data-variant="ghost"
                onClick={handleHint}
                disabled={!boardReady || hasWon || !hasEmptyCells}
              >
                Hint
              </button>
              <button
                type="button"
                className={styles.button}
                data-variant="outline"
                onClick={handleCheck}
                disabled={!boardReady}
              >
                Check
              </button>
            </div>
          </div>

          <p className={styles.message} data-variant={messageTone} role="status" aria-live="polite">
            {messageToShow}
          </p>

          <div className={styles.boardWrapper}>
            {boardReady ? (
              <div className={styles.boardInner}>
                <div className={styles.grid} role="grid" aria-label="Sudoku board">
                  {board.map((row, r) => (
                    <div className={styles.row} role="row" key={`row-${r}`}>
                      {row.map((cell, c) => {
                        const game = sudokuRef.current
                        const isPrefilled = game?.isPrefilled(r, c)
                        const isHinted = game?.isHinted(r, c)
                        const isLocked = Boolean(isPrefilled || (isHinted && cell !== 0))
                        const key = `${r},${c}`
                        const isConflict = conflictCells.has(key)
                        const isIncorrect = incorrectCells.has(key)
                        const isSelected = selected && selected.r === r && selected.c === c
                        const sameNumber = Boolean(selectedValue && selectedValue === cell && !isSelected && cell !== 0)
                        const boxClass = (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0 ? styles.boxBase : styles.boxAlt
                        const dividerBottom = (r === 2 || r === 5) ? styles.sectionBorderBottom : ''
                        const dividerRight = (c === 2 || c === 5) ? styles.sectionBorderRight : ''
                        const isBoxEven = (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0
                        const cellClasses = join(
                          styles.cell,
                          boxClass,
                          dividerBottom,
                          dividerRight,
                          isPrefilled ? styles.prefilled : '',
                          isHinted ? styles.hint : '',
                          isLocked ? styles.locked : '',
                          isSelected ? styles.selected : '',
                          sameNumber ? styles.sameNumber : '',
                          isConflict ? styles.conflict : '',
                          isIncorrect ? styles.incorrect : '',
                          !isBoxEven ? styles.boxOddHighlight : ''
                        )
                        return (
                          <input
                            key={`cell-${r}-${c}`}
                            id={`cell-${r}-${c}`}
                            type="text"
                            inputMode="numeric"
                            pattern="[1-9]*"
                            maxLength={1}
                            aria-label={`Row ${r + 1}, Column ${c + 1}`}
                            aria-invalid={isConflict || isIncorrect}
                            aria-disabled={isLocked}
                            role="gridcell"
                            className={cellClasses}
                            value={cell === 0 ? '' : String(cell)}
                            disabled={isLocked}
                            autoComplete="off"
                            onFocus={() => setSelected({ r, c })}
                            onChange={(event) => handleInput(r, c, event.target.value)}
                            onKeyDown={(event) => handleKeyDown(event, r, c)}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.loading}>Preparing your puzzle...</div>
            )}
          </div>

          <div className={styles.statusRow}>
            <span className={styles.statusItem}><strong>Level:</strong> {difficulty}</span>
            <span className={styles.statusItem}><strong>Hints used:</strong> {hintsUsed}</span>
            <span className={styles.statusItem}><strong>Theme:</strong> {theme === 'dark' ? 'Dark' : 'Light'}</span>
          </div>
          <p className={styles.legend}>Cells highlight in teal when matching and in red when a move violates Sudoku rules. Prefilled and hinted cells are locked.</p>
        </section>

        <section className={join(styles.panel, styles.leaderboardCard)}>
          <Top10 entries={topScores} className={styles.leaderboard} />
        </section>
      </div>
    </div>
  )
}





