# Copilot Instruction File

This file provides instructions and context for GitHub Copilot and any developer working on this Sudoku project.

Please keep this file at the project root so Copilot can reference it when making suggestions.

Primary goals and style
- Use ES6+ JavaScript (let, const, arrow functions, classes where appropriate, async/await).
- Prefer modular code and small reusable functions.
- Add JSDoc comments for functions and classes.
- Use event delegation for DOM listeners (attach listeners to container elements, not each cell individually).
- Use try/catch for operations that can fail and provide clear user-facing error messages.

Project requirements (high level, from the rubric)
- Migrate this starter to a React + NextJS application (App Router).
- Split UI into reusable components at minimum: Board, Cell, Controls, Top10Scores.
- Implement difficulty levels (Easy/Medium/Hard) and New Game generation.
- Ensure every generated puzzle has exactly one solution and can be solved without guessing.
- Implement Hint and Check features.
- Keep top 10 times in localStorage with metadata (name, time, difficulty, hints used).
- Dark mode toggle.
- Accessibility and responsive layout; color contrast must meet accessibility guidelines.
- Each 3x3 square should be styled with alternating colors.

Behavior details and enforcement
- Prefilled cells: Must be disabled and styled differently. User cannot change them.
- Inputs: Cells accept only digits 1-9. Use input validation and prevent invalid characters.
- Immediate feedback: If a user enters a number that conflicts with Sudoku rules (duplicate in row/col/box), highlight the entered cell and other conflicting cells.
- Game completion: After each cell change, check whether puzzle is solved correctly. When the last correct cell is entered, show a congratulatory dialog and run top-10 scoring flow.
- Hints: Fill a single empty cell with the correct number, mark it visually, and disable that cell for the remainder of the game.

Copilot preferences
- Suggest React + NextJS (App Router) scaffolding and component structure when asked.
- Suggest Tailwind CSS or modular CSS; either is fine—prefer Tailwind for speed but ensure accessibility.
- When asked to generate code, prefer functional React components with hooks.
- Include minimal tests where reasonable (simple unit tests or utilities for validator/solver functions).

Files of interest
- `sudoku.js` — original starter JavaScript. When refactoring, copy logic into new React components and modernize the code.
- `index.html`, `styles.css` — original UI; useful for reference but to be replaced when migrating to NextJS.

Notes and constraints
- Keep this project self-contained and runnable locally. Add a `README.md` with setup steps once the NextJS migration is done.
- Do not upload secrets; if there are environment variables, add `.env.local` to `.gitignore`.

If anything is ambiguous, make reasonable assumptions and document them in code comments or in this file.
