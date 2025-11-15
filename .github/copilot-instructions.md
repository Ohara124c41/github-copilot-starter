# Copilot Instructions

<!-- Copilot reads this file from the default `.github/copilot-instructions.md` path. -->

## Style + Technology
- Build with Next.js App Router and functional React components. Keep logic in reusable hooks or utilities when possible.
- Use modern JavaScript (ES2020+). Prefer `const`/`let`, arrow functions, optional chaining, template literals, and modules.
- Add concise comments for non-obvious logic, especially around Sudoku generation/validation and leaderboard persistence.
- Favor modular CSS (CSS modules) and CSS variables for theming. Respect accessible color contrast.
- Handle potential errors (board generation, localStorage access, timers) with `try/catch` and show helpful user messages.

## Gameplay + UX Rules
- Provide Easy/Medium/Hard boards with unique, logic-solvable solutions. Valid puzzles should never require guessing.
- Enforce inputs of digits 1-9, disable prefilled/hinted cells, and highlight conflicts immediately (row/column/box + conflicting cells).
- Allow hints (fills a single cell, marks it, and disables editing) and a Check button that highlights incorrect entries.
- After every valid input, detect solved boards automatically and congratulate the user (also trigger leaderboard flow).
- Include a timer tied to puzzle start/end. Record time, difficulty, and hints in a local Top 10 table.

## Accessibility + UI
- Add a light/dark mode toggle backed by CSS custom properties.
- Sudoku grid must be responsive, keep alternating 3x3 colors, and avoid layout shift (use outlines/box-shadows instead of changing border widths on focus).
- Use semantic roles (`grid`, `gridcell`, etc.), aria labels, and aria-live regions for status text.
- Zebra stripe the leaderboard table, keep it keyboard accessible, and provide empty-state messaging.

## Files of Interest
- `app/page.jsx` ? landing page that renders the Sudoku experience.
- `components/Game.jsx` ? overall Sudoku experience (controls, grid, hint/check logic).
- `components/Top10.jsx` ? leaderboard UI. Reads data from `utils/leaderboard.js`.
- `utils/sudoku.js` ? puzzle generation, validation, hints, timer.
- `utils/leaderboard.js` ? handles persistence in `localStorage`.

If you change the location of this instructions file in VS Code, call it out with a comment explaining the new path.
