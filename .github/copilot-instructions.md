# Copilot Instructions (Project Guidance)

Purpose: give Copilot concise, prescriptive rules for this Sudoku app. Keep suggestions aligned with ES2020+ best practices and the rubric requirements.

Stack & Structure
- Use Next.js (App Router) with React functional components/hooks. ESLint enabled.
- Event delegation for board interactions; no inline listeners per-cell beyond React handlers.
- Split UI: Game board/controls, Top 10 table, layout shell. Logic in `utils/`, UI in `components/`. CSS Modules for component styles; design tokens in `styles/globals.css`.

Gameplay Rules
- Generate puzzles with exactly one solution, solvable without guessing. Difficulty (Easy/Medium/Hard) adjusts clues.
- Cells accept only 1-9; prefilled and hinted cells are locked. Immediate conflict feedback (row/col/box) and same-number highlight.
- Auto-check completion after every input; on solve, show a congratulatory dialog and run leaderboard logic.
- Hint button fills one empty cell, colors it, and locks it. Check button highlights incorrect cells until fixed.

Styling & Theming
- Light/dark mode toggle; maintain accessible contrast. Alternating 3x3 boxes must stay visible even when filled. Avoid layout shift?use shadows instead of changing borders.
- Distinct visuals for prefilled, hinted, filled, conflict, incorrect, and selected states. Zebra-strip the leaderboard.
- Responsive layout centered on the page; use a Google font via `next/font`.

Accessibility
- Semantic roles (`grid`, `gridcell`, `table`, etc.), meaningful `aria-label`s, `aria-live` for status text.
- Keyboard navigation for cells (arrows, backspace/delete, enter for check, h/H for hint) and for buttons.

Data & Persistence
- Store Top 10 locally (name, time, difficulty, hints). Sort fastest-to-slowest; clear empty state.

Coding Standards
- Modern JS only (`const`/`let`, arrow functions, modules). Use `async/await` with `try/catch` for risky ops (generation, localStorage, timers); show user-friendly errors.
- Prefer pure helpers for solver/validator in `utils/sudoku.js`; keep UI components lean.

Testing & Quality
- Keep lint clean. Add unit coverage for solver/validator where feasible. Keep comments concise and purposeful.
