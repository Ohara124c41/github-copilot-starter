export default class SudokuGame {
  constructor() {
    this.SIZE = 9
    this.EMPTY = 0
    this.hintsUsed = 0
    this.prefilled = new Set()
    this.hinted = new Set()
    this.startTime = null
  }

  deepCopy(arr) {
    return arr.map((r) => r.slice())
  }

  createEmptyBoard() {
    const arr = []
    for (let i = 0; i < this.SIZE; i++) {
      arr[i] = []
      for (let j = 0; j < this.SIZE; j++) arr[i][j] = this.EMPTY
    }
    return arr
  }

  isSafe(board, row, col, num) {
    for (let x = 0; x < this.SIZE; x++) {
      if (board[row][x] === num || board[x][col] === num) return false
    }
    const sr = row - (row % 3)
    const sc = col - (col % 3)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (board[sr + i][sc + j] === num) return false
    return true
  }

  fillBoard(board) {
    for (let r = 0; r < this.SIZE; r++) {
      for (let c = 0; c < this.SIZE; c++) {
        if (board[r][c] === this.EMPTY) {
          const nums = Array.from({ length: this.SIZE }, (_, i) => i + 1)
          for (let k = nums.length - 1; k > 0; k--) {
            const ri = Math.floor(Math.random() * (k + 1))
            ;[nums[k], nums[ri]] = [nums[ri], nums[k]]
          }
          for (const n of nums) {
            if (this.isSafe(board, r, c, n)) {
              board[r][c] = n
              if (this.fillBoard(board)) return true
              board[r][c] = this.EMPTY
            }
          }
          return false
        }
      }
    }
    return true
  }

  solveCount(b, limit = Infinity) {
    let count = 0
    const findEmpty = (board) => {
      for (let r = 0; r < this.SIZE; r++) for (let c = 0; c < this.SIZE; c++) if (board[r][c] === this.EMPTY) return [r, c]
      return null
    }
    const backtrack = (board) => {
      if (count >= limit) return
      const p = findEmpty(board)
      if (!p) {
        count++
        return
      }
      const [r, c] = p
      for (let n = 1; n <= this.SIZE; n++) {
        if (this.isSafe(board, r, c, n)) {
          board[r][c] = n
          backtrack(board)
          board[r][c] = this.EMPTY
          if (count >= limit) return
        }
      }
    }
    backtrack(b)
    return count
  }

  removeCells(board, clues) {
    let removalsNeeded = this.SIZE * this.SIZE - clues
    const cells = []
    for (let r = 0; r < this.SIZE; r++) for (let c = 0; c < this.SIZE; c++) cells.push([r, c])
    for (let k = cells.length - 1; k > 0; k--) {
      const idx = Math.floor(Math.random() * (k + 1))
      ;[cells[k], cells[idx]] = [cells[idx], cells[k]]
    }
    let i = 0
    const maxAttempts = cells.length * 2
    let attempts = 0
    while (removalsNeeded > 0 && i < cells.length && attempts < maxAttempts) {
      const [r, c] = cells[i++]
      if (board[r][c] === this.EMPTY) continue
      const backup = board[r][c]
      board[r][c] = this.EMPTY
      const testBoard = this.deepCopy(board)
      const count = this.solveCount(testBoard, 2)
      if (count === 1) {
        removalsNeeded--
      } else {
        board[r][c] = backup
      }
      attempts++
    }
  }

  generatePuzzle(clues = 35) {
    const b = this.createEmptyBoard()
    this.fillBoard(b)
    const solution = this.deepCopy(b)
    this.removeCells(b, clues)
    // set prefilled set
    this.prefilled = new Set()
    for (let r = 0; r < this.SIZE; r++) for (let c = 0; c < this.SIZE; c++) if (b[r][c] !== this.EMPTY) this.prefilled.add(`${r},${c}`)
    return { board: this.deepCopy(b), solution }
  }

  isPrefilled(r, c) {
    return this.prefilled.has(`${r},${c}`)
  }

  isHinted(r, c) {
    return this.hinted.has(`${r},${c}`)
  }

  /**
   * Check whether placing `num` at (row,col) is safe ignoring the current value at that cell.
   */
  isSafeIgnoring(board, row, col, num) {
    // Don't modify original board; just check conflicts other than (row,col)
    for (let x = 0; x < this.SIZE; x++) {
      if (x !== col && board[row][x] === num) return false
      if (x !== row && board[x][col] === num) return false
    }
    const sr = row - (row % 3)
    const sc = col - (col % 3)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const r = sr + i
      const c = sc + j
      if ((r !== row || c !== col) && board[r][c] === num) return false
    }
    return true
  }

  /**
   * Return a list of coordinates that conflict with value at (row,col)
   * Useful for highlighting conflicting cells in the UI.
   * Returns array of [r,c]
   */
  getConflicts(board, row, col, value) {
    const conflicts = []
    if (!value) return conflicts
    for (let x = 0; x < this.SIZE; x++) {
      if (x !== col && board[row][x] === value) conflicts.push([row, x])
      if (x !== row && board[x][col] === value) conflicts.push([x, col])
    }
    const sr = row - (row % 3)
    const sc = col - (col % 3)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const r = sr + i
      const c = sc + j
      if ((r !== row || c !== col) && board[r][c] === value) conflicts.push([r, c])
    }
    // dedupe
    const seen = new Set()
    return conflicts.filter(([r, c]) => {
      const k = `${r},${c}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }

  giveHint(board, solution) {
    this.hintsUsed++
    const empties = []
    for (let r = 0; r < this.SIZE; r++) for (let c = 0; c < this.SIZE; c++) if (board[r][c] === this.EMPTY) empties.push([r, c])
    if (empties.length === 0) return null
    const [r, c] = empties[Math.floor(Math.random() * empties.length)]
    const newBoard = this.deepCopy(board)
    newBoard[r][c] = solution[r][c]
    this.hinted.add(`${r},${c}`)
    return { board: newBoard, r, c }
  }

  checkAgainstSolution(board, solution) {
    for (let r = 0; r < this.SIZE; r++) for (let c = 0; c < this.SIZE; c++) if (board[r][c] !== solution[r][c]) return false
    return true
  }

  startTimer() {
    this.startTime = Date.now()
    this.hintsUsed = 0
  }

  stopTimer() {
    if (!this.startTime) return 0
    const elapsed = Math.round((Date.now() - this.startTime) / 1000)
    this.startTime = null
    return elapsed
  }
}
