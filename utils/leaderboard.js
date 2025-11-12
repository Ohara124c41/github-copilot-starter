export default class Leaderboard {
  constructor(storageKey = 'sudoku_top_scores', limit = 10) {
    this.storageKey = storageKey
    this.limit = limit
    this.scores = this._load()
  }

  _load() {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return []
      return JSON.parse(raw)
    } catch (e) {
      console.error('Failed to load leaderboard', e)
      return []
    }
  }

  _save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.scores))
    } catch (e) {
      console.error('Failed to save leaderboard', e)
    }
  }

  qualifies(timeSec) {
    if (this.scores.length < this.limit) return true
    return this.scores.some((s) => timeSec < s.time)
  }

  add(score) {
    this.scores.push(score)
    this.scores.sort((a, b) => a.time - b.time)
    if (this.scores.length > this.limit) this.scores.length = this.limit
    this._save()
  }

  /** Clear all scores from localStorage */
  clear() {
    this.scores = []
    try {
      localStorage.removeItem(this.storageKey)
    } catch (e) {
      console.error('Failed to clear leaderboard', e)
    }
  }

  getAll() {
    return this.scores.slice()
  }
}
