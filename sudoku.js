// This file contains only JavaScript for the Sudoku game. No HTML or CSS should be here.
(() => {
    /** Current working board (9x9) where 0 represents an empty cell */
    let board = [];
    /** Full solution for the current puzzle (9x9) */
    let solution = [];
    const SIZE = 9;
    const EMPTY = 0;
    // game state
    let startTime = null;
    let hintsUsed = 0;
    let prefilledSet = new Set();
    let hintedSet = new Set();
    let gameCompleted = false;
    let currentClues = 35;

    /**
     * Deep copy a 2D array (board)
     * @param {number[][]} arr
     * @returns {number[][]}
     */
    const deepCopy = (arr) => arr.map((r) => r.slice());

    /** Create an empty 9x9 board filled with EMPTY */
    const createEmptyBoard = () => {
        const arr = [];
        for (let i = 0; i < SIZE; i++) {
            arr[i] = [];
            for (let j = 0; j < SIZE; j++) {
                arr[i][j] = EMPTY;
            }
        }
        return arr;
    };

    /**
     * Check whether `num` can be placed at (row, col) without breaking Sudoku rules.
     * @param {number[][]} board
     * @param {number} row
     * @param {number} col
     * @param {number} num
     * @returns {boolean}
     */
    const isSafe = (board, row, col, num) => {
        for (let x = 0; x < SIZE; x++) {
            if (board[row][x] === num || board[x][col] === num) {
                return false;
            }
        }
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * Backtracking Sudoku generator: fills the board with a valid solution.
     * @param {number[][]} board
     * @returns {boolean} true if board filled successfully
     */
    const fillBoard = (board) => {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === EMPTY) {
                    const possibleNumbers = Array.from({ length: SIZE }, (_, i) => i + 1);
                    // Fisher-Yates shuffle
                    for (let k = possibleNumbers.length - 1; k > 0; k--) {
                        const r = Math.floor(Math.random() * (k + 1));
                        [possibleNumbers[k], possibleNumbers[r]] = [possibleNumbers[r], possibleNumbers[k]];
                    }
                    for (let num of possibleNumbers) {
                        if (isSafe(board, row, col, num)) {
                            board[row][col] = num;
                            if (fillBoard(board)) return true;
                            board[row][col] = EMPTY;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    };

    /** Remove cells randomly to leave `clues` numbers on the board */
    const removeCells = (board, clues) => {
        // Remove cells while ensuring the puzzle retains a unique solution.
        let removalsNeeded = SIZE * SIZE - clues;
        // Create list of all cell coordinates and shuffle
        const cells = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) cells.push([r, c]);
        }
        for (let k = cells.length - 1; k > 0; k--) {
            const idx = Math.floor(Math.random() * (k + 1));
            [cells[k], cells[idx]] = [cells[idx], cells[k]];
        }

        let i = 0;
        const maxAttempts = cells.length * 2;
        let attempts = 0;
        while (removalsNeeded > 0 && i < cells.length && attempts < maxAttempts) {
            const [r, c] = cells[i];
            i++;
            if (board[r][c] === EMPTY) continue;
            const backup = board[r][c];
            board[r][c] = EMPTY;

            // Copy and test how many solutions remain (stop after 2)
            const testBoard = deepCopy(board);
            const count = solveCount(testBoard, 2);
            if (count === 1) {
                removalsNeeded--;
            } else {
                // revert removal
                board[r][c] = backup;
            }
            attempts++;
        }
    };

    /**
     * Count the number of solutions for a given board using backtracking.
     * Stops early if the count reaches `limit`.
     * @param {number[][]} b
     * @param {number} limit
     * @returns {number}
     */
    const solveCount = (b, limit = Infinity) => {
        let count = 0;

        const findEmpty = (board) => {
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (board[r][c] === EMPTY) return [r, c];
                }
            }
            return null;
        };

        const backtrack = (board) => {
            if (count >= limit) return;
            const pos = findEmpty(board);
            if (!pos) {
                count++;
                return;
            }
            const [r, c] = pos;
            for (let n = 1; n <= SIZE; n++) {
                if (isSafe(board, r, c, n)) {
                    board[r][c] = n;
                    backtrack(board);
                    board[r][c] = EMPTY;
                    if (count >= limit) return;
                }
            }
        };

        backtrack(b);
        return count;
    };

    /**
     * Render the board into the DOM. Uses data attributes for row/col and
     * event delegation for input handling (single listener attached to board container).
     */
    const renderBoard = () => {
        const boardDiv = document.getElementById('sudoku-board');
        boardDiv.innerHTML = '';
        for (let i = 0; i < SIZE; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'sudoku-row';
            for (let j = 0; j < SIZE; j++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.className = 'sudoku-cell';
                input.setAttribute('data-row', String(i));
                input.setAttribute('data-col', String(j));
                // alternating 3x3 box classes
                const boxAlt = ((Math.floor(i / 3) + Math.floor(j / 3)) % 2 === 0) ? 'box-base' : 'box-alt';
                input.classList.add(boxAlt);
                if (board[i][j] !== EMPTY) {
                    input.value = board[i][j];
                    input.disabled = true;
                    const key = `${i},${j}`;
                    if (prefilledSet.has(key)) input.classList.add('prefilled');
                    if (hintedSet.has(key)) input.classList.add('hint');
                } else {
                    input.value = '';
                }
                rowDiv.appendChild(input);
            }
            boardDiv.appendChild(rowDiv);
        }

        // Attach a single input listener using event delegation. Add only once.
        if (!boardDiv._hasListener) {
            boardDiv.addEventListener('input', (e) => {
                const target = e.target;
                if (!target || !target.classList.contains('sudoku-cell') || target.disabled) return;
                // Only allow digits 1-9
                const cleaned = target.value.replace(/[^1-9]/g, '');
                target.value = cleaned;
                const r = Number(target.getAttribute('data-row'));
                const c = Number(target.getAttribute('data-col'));
                board[r][c] = cleaned ? parseInt(cleaned, 10) : EMPTY;

                // Clear previous invalid highlights
                clearInvalidHighlights();

                // If the entered value is not legal, highlight the cell and conflicts
                if (cleaned && !isSafeIgnoringCell(board, r, c, board[r][c])) {
                    target.classList.add('invalid');
                    highlightConflicts(r, c, board[r][c]);
                }
            });
            boardDiv._hasListener = true;
        }
    };

    /** Helper: clear all invalid highlights in the board DOM */
    const clearInvalidHighlights = () => {
        const boardDiv = document.getElementById('sudoku-board');
        const inputs = boardDiv.querySelectorAll('.sudoku-cell.invalid, .sudoku-cell.conflict');
        inputs.forEach((inp) => {
            inp.classList.remove('invalid', 'conflict');
        });
    };

    /**
     * Check whether placing `num` at (row, col) is legal *ignoring* the current value
     * at (row, col). Useful for validating a user's tentative input.
     */
    const isSafeIgnoringCell = (board, row, col, num) => {
        // Temporarily clear current cell
        const orig = board[row][col];
        board[row][col] = EMPTY;
        const ok = isSafe(board, row, col, num);
        board[row][col] = orig;
        return ok;
    };

    /** Highlight other cells that conflict with (row,col,value) */
    const highlightConflicts = (row, col, value) => {
        const boardDiv = document.getElementById('sudoku-board');
        // Row and column
        for (let x = 0; x < SIZE; x++) {
            if (x !== col && board[row][x] === value) {
                const sel = `input[data-row="${row}"][data-col="${x}"]`;
                const node = boardDiv.querySelector(sel);
                if (node) node.classList.add('conflict');
            }
            if (x !== row && board[x][col] === value) {
                const sel = `input[data-row="${x}"][data-col="${col}"]`;
                const node = boardDiv.querySelector(sel);
                if (node) node.classList.add('conflict');
            }
        }
        // 3x3 box
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const r = startRow + i;
                const c = startCol + j;
                if ((r !== row || c !== col) && board[r][c] === value) {
                    const sel = `input[data-row="${r}"][data-col="${c}"]`;
                    const node = boardDiv.querySelector(sel);
                    if (node) node.classList.add('conflict');
                }
            }
        }
    };

    /**
     * Simple Leaderboard manager that keeps top N scores in localStorage.
     * Uses OOP style with methods to check/add scores.
     */
    class Leaderboard {
        constructor(storageKey = 'sudoku_top_scores', limit = 10) {
            this.storageKey = storageKey;
            this.limit = limit;
            this.scores = this._load();
        }

        _load() {
            try {
                const raw = localStorage.getItem(this.storageKey);
                if (!raw) return [];
                return JSON.parse(raw);
            } catch (e) {
                console.error('Failed to load leaderboard', e);
                return [];
            }
        }

        _save() {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
            } catch (e) {
                console.error('Failed to save leaderboard', e);
            }
        }

        /**
         * Check if a time (seconds) would be in the top list
         * @param {number} timeSec
         */
        qualifies(timeSec) {
            if (this.scores.length < this.limit) return true;
            return this.scores.some(s => s.time < 0 ? true : timeSec < s.time);
        }

        /**
         * Add a new score object {name, time, difficulty, hints}
         */
        add(score) {
            this.scores.push(score);
            // sort by time ascending
            this.scores.sort((a, b) => a.time - b.time);
            if (this.scores.length > this.limit) this.scores.length = this.limit;
            this._save();
        }

        getAll() { return this.scores.slice(); }
    }

    // instantiate a leaderboard
    const leaderboard = new Leaderboard();

    /** Provide a hint: fill one empty cell with the correct solution and disable it */
    const giveHint = () => {
        // find empty cells
        const empties = [];
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (board[r][c] === EMPTY) empties.push([r, c]);
        if (empties.length === 0) return;
        const [r, c] = empties[Math.floor(Math.random() * empties.length)];
        board[r][c] = solution[r][c];
        // re-render but keep hint styled
        renderBoard();
        const sel = `input[data-row="${r}"][data-col="${c}"]`;
        const node = document.querySelector(sel);
        if (node) {
            node.classList.add('hint');
            node.disabled = true;
        }
    };

    /**
     * Check the current board against the solution and mark incorrect cells.
     * Shows a message on success or if there are incorrect cells.
     */
    const checkSolution = () => {
        let correct = true;
        const boardDiv = document.getElementById('sudoku-board');
        const inputs = boardDiv.querySelectorAll('input.sudoku-cell');
        inputs.forEach((inp) => inp.classList.remove('incorrect'));
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const idx = i * SIZE + j;
                const inp = inputs[idx];
                if (solution[i][j] !== board[i][j]) {
                    if (inp) inp.classList.add('incorrect');
                    correct = false;
                }
            }
        }
        const msg = document.getElementById('message');
        if (correct) {
            msg.style.color = '#388e3c';
            msg.innerHTML = 'Congratulations! You solved it!';
            if (!gameCompleted) {
                gameCompleted = true;
                handleCompletion();
            }
        } else {
            msg.style.color = '#d32f2f';
            msg.innerHTML = 'Some cells are incorrect.';
        }
    };

    /**
     * Start a new game. Default difficulty (clues) is set to medium (35).
     * Attach global functions for legacy compatibility (window.newGame etc.).
     * Errors are caught and shown to the user.
     * @param {number} clues - Number of initial clues to leave (higher -> easier)
     */
    const newGame = (clues = 35) => {
        try {
            // reset state
            gameCompleted = false;
            hintsUsed = 0;
            hintedSet = new Set();
            prefilledSet = new Set();
            currentClues = clues;

            const newBoard = createEmptyBoard();
            fillBoard(newBoard);
            solution = deepCopy(newBoard);
            removeCells(newBoard, clues);
            board = deepCopy(newBoard);

            // compute prefilled set (cells that are initially filled and should be disabled)
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (board[r][c] !== EMPTY) prefilledSet.add(`${r},${c}`);
                }
            }

            renderBoard();
            // start timer
            startTime = Date.now();
            const msgEl = document.getElementById('message');
            if (msgEl) msgEl.innerHTML = '';
        } catch (err) {
            console.error('Failed to start new game', err);
            const msgEl = document.getElementById('message');
            if (msgEl) {
                msgEl.style.color = '#d32f2f';
                msgEl.innerHTML = 'An error occurred while starting a new game.';
            }
        }
    };

    // Expose for legacy HTML usage
    window.newGame = newGame;
    window.checkSolution = checkSolution;
    window.giveHint = () => {
        giveHint();
        hintsUsed++;
    };
    window.getTopScores = () => leaderboard.getAll();

    /** Handle successful completion: compute elapsed time, update leaderboard if needed */
    function handleCompletion() {
        const elapsedSec = Math.round((Date.now() - startTime) / 1000);
        const difficulty = currentClues >= 40 ? 'Easy' : currentClues >= 32 ? 'Medium' : 'Hard';
        if (leaderboard.qualifies(elapsedSec)) {
            const name = prompt('You made the Top 10! Enter your name:', '');
            const entry = {
                name: name && name.trim() ? name.trim() : 'Anonymous',
                time: elapsedSec,
                difficulty,
                hints: hintsUsed,
                date: new Date().toISOString(),
            };
            leaderboard.add(entry);
            // show updated leaderboard in console for now
            console.log('Top scores:', leaderboard.getAll());
        } else {
            console.log('Completed in', elapsedSec, 'seconds. Not in Top 10.');
        }
    }

    // Start game on load
    newGame();
})();