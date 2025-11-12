'use client'
import { useEffect, useRef, useState } from 'react'
import SudokuGame from '../utils/sudoku'
import Leaderboard from '../utils/leaderboard'
import Top10 from './Top10'
import '../styles/globals.css'

export default function Game() {
  const sudokuRef = useRef(null)
  const lbRef = useRef(null)
  const [board, setBoard] = useState([])
  const [solution, setSolution] = useState([])
  const [difficulty, setDifficulty] = useState('Medium')
  const [clues, setClues] = useState(35)
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState({ r: 0, c: 0 })
  const [topScores, setTopScores] = useState([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Initialize on client side only
    setIsClient(true)
    const g = new SudokuGame()
    sudokuRef.current = g
    lbRef.current = new Leaderboard()
    startNewGame(35)

    // Expose debug/admin functions to window for console access
    window.clearLeaderboard = () => {
      if (lbRef.current) {
        lbRef.current.clear()
        setTopScores([])
        console.log('Leaderboard cleared')
      }
    }
    window.getLeaderboard = () => {
      return lbRef.current ? lbRef.current.getAll() : []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const startNewGame = (cluesParam = 35) => {
    const g = sudokuRef.current
    if (!g) return
    const { board: b, solution: s } = g.generatePuzzle(cluesParam)
    setBoard(b)
    setSolution(s)
    setMessage('')
    setClues(cluesParam)
    setDifficulty(cluesParam >= 40 ? 'Easy' : cluesParam >= 32 ? 'Medium' : 'Hard')
    g.startTimer()
    // select first empty cell
    for (let r = 0; r < b.length; r++) {
      for (let c = 0; c < b[r].length; c++) {
        if (b[r][c] === 0) {
          setSelected({ r, c })
          // focus after render
          setTimeout(() => focusCell(r, c), 20)
          return
        }
      }
    }
  }

  const focusCell = (r, c) => {
    const el = document.getElementById(`cell-${r}-${c}`)
    if (el) el.focus()
  }

  const handleInput = (r, c, val) => {
    const cleaned = val.replace(/[^1-9]/g, '')
    const newBoard = board.map((row) => row.slice())
    newBoard[r][c] = cleaned ? parseInt(cleaned, 10) : 0
    setBoard(newBoard)
    setSelected({ r, c })
  }

  const handleCheck = () => {
    const g = sudokuRef.current
    const lb = lbRef.current
    if (!g || !lb) return
    const ok = g.checkAgainstSolution(board, solution)
    if (ok) {
      setMessage('Congratulations!')
      const elapsed = g.stopTimer()
      if (lb.qualifies(elapsed)) {
        const name = prompt('Top 10! Enter name:', 'Anonymous')
        lb.add({ name: name || 'Anonymous', time: elapsed, difficulty, hints: g.hintsUsed })
        setTopScores(lb.getAll())
      }
    } else {
      setMessage('There are incorrect cells')
    }
  }

  const handleHint = () => {
    const g = sudokuRef.current
    const lb = lbRef.current
    if (!g || !lb) return
    const res = g.giveHint(board, solution)
    if (res) {
      setBoard(res.board)
      setMessage('Hint provided')
      setTopScores(lb.getAll())
    }
  }

  const handleKeyDown = (e, r, c) => {
    const g = sudokuRef.current
    if (!g) return
    const key = e.key
    if (key === 'ArrowUp') { e.preventDefault(); const nr = Math.max(0, r - 1); focusCell(nr, c); setSelected({ r: nr, c }); return }
    if (key === 'ArrowDown') { e.preventDefault(); const nr = Math.min(8, r + 1); focusCell(nr, c); setSelected({ r: nr, c }); return }
    if (key === 'ArrowLeft') { e.preventDefault(); const nc = Math.max(0, c - 1); focusCell(r, nc); setSelected({ r, c: nc }); return }
    if (key === 'ArrowRight') { e.preventDefault(); const nc = Math.min(8, c + 1); focusCell(r, nc); setSelected({ r, c: nc }); return }
    if (key === 'Backspace' || key === 'Delete') { e.preventDefault(); handleInput(r, c, ''); return }
    if (key === 'Enter') { e.preventDefault(); handleCheck(); return }
    if (key === 'h' || key === 'H') { e.preventDefault(); handleHint(); return }
    // digits 1-9 typed
    if (/^[1-9]$/.test(key)) { e.preventDefault(); handleInput(r, c, key); // move right
      const nc = Math.min(8, c + 1); focusCell(r, nc); setSelected({ r, c: nc }); return }
  }

  if (!isClient || !board || board.length === 0) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>

  return (
    <div>
      <div id="controls" className="controls">
        <label>
          Difficulty:
          <select value={difficulty} onChange={(e) => { const d = e.target.value; setDifficulty(d); const c = d === 'Easy' ? 45 : d === 'Medium' ? 35 : 28; setClues(c); }}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </label>
        <button onClick={() => startNewGame(clues)}>New Game</button>
        <button onClick={handleHint}>Hint</button>
        <button onClick={handleCheck}>Check</button>
        <span id="message">{message}</span>
      </div>

      <div id="sudoku-board" role="grid" aria-label="Sudoku board">
        {board.map((row, r) => (
          <div className="sudoku-row" role="row" key={r}>
            {row.map((cell, c) => {
              const g = sudokuRef.current
              const isPrefilled = g && g.isPrefilled(r, c)
              const isHinted = g && g.isHinted(r, c)
              const selectedVal = board[selected.r] ? board[selected.r][selected.c] : 0
              const isSelected = selected.r === r && selected.c === c
              const sameNumber = selectedVal && board[r][c] === selectedVal && !(isSelected)
              const conflict = cell !== 0 && g && !g.isSafeIgnoring(board, r, c, board[r][c])
              const boxAlt = ((Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0) ? 'box-base' : 'box-alt'
              const className = [
                'sudoku-cell',
                boxAlt,
                isPrefilled ? 'prefilled' : '',
                isHinted ? 'hint' : '',
                isSelected ? 'selected' : '',
                sameNumber ? 'same-number' : '',
                conflict ? 'conflict' : ''
              ].filter(Boolean).join(' ')
              return (
                <input
                  id={`cell-${r}-${c}`}
                  key={`${r}-${c}`}
                  role="gridcell"
                  aria-label={`Row ${r + 1} Column ${c + 1}`}
                  aria-selected={isSelected}
                  className={className}
                  value={cell === 0 ? '' : cell}
                  disabled={cell !== 0 && isPrefilled}
                  onFocus={() => setSelected({ r, c })}
                  onKeyDown={(e) => handleKeyDown(e, r, c)}
                  onChange={(e) => handleInput(r, c, e.target.value)}
                />
              )
            })}
          </div>
        ))}
      </div>

      <Top10 entries={topScores} />
    </div>
  )
}
