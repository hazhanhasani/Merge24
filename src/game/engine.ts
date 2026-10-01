export const GRID_COLUMNS = 4
export const GRID_ROWS = 6
export const CELL_COUNT = GRID_COLUMNS * GRID_ROWS

export type GameStatus = 'playing' | 'game-over'
export type RandomSource = () => number

export interface Tile {
  id: number
  value: number
}

export interface GameState {
  board: Array<Tile | null>
  score: number
  moves: number
  status: GameStatus
  nextId: number
}

export interface MoveResult {
  state: GameState
  moved: boolean
  merged: boolean
  gained: number
}

const randomIndex = (length: number, rng: RandomSource): number => {
  if (length <= 1) return 0

  const sample = rng()
  const safeSample = Number.isFinite(sample)
    ? Math.min(0.999999999, Math.max(0, sample))
    : 0

  return Math.floor(safeSample * length)
}

export const getAdjacentIndices = (index: number): number[] => {
  if (index < 0 || index >= CELL_COUNT) return []

  const row = Math.floor(index / GRID_COLUMNS)
  const column = index % GRID_COLUMNS
  const neighbors: number[] = []

  if (row > 0) neighbors.push(index - GRID_COLUMNS)
  if (row < GRID_ROWS - 1) neighbors.push(index + GRID_COLUMNS)
  if (column > 0) neighbors.push(index - 1)
  if (column < GRID_COLUMNS - 1) neighbors.push(index + 1)

  return neighbors
}

export const areAdjacent = (from: number, to: number): boolean =>
  getAdjacentIndices(from).includes(to)

const spawnRandomTile = (
  board: Array<Tile | null>,
  nextId: number,
  rng: RandomSource,
): number => {
  const emptyIndices = board
    .map((tile, index) => (tile === null ? index : -1))
    .filter((index) => index >= 0)

  if (emptyIndices.length === 0) return nextId

  const index = emptyIndices[randomIndex(emptyIndices.length, rng)]
  if (index === undefined) return nextId

  const value = rng() < 0.9 ? 1 : 2
  board[index] = { id: nextId, value }

  return nextId + 1
}

export const createGame = (rng: RandomSource = Math.random): GameState => {
  const board: Array<Tile | null> = Array.from({ length: CELL_COUNT }, () => null)
  const firstIndex = randomIndex(CELL_COUNT, rng)
  const neighbors = getAdjacentIndices(firstIndex)
  const secondIndex = neighbors[randomIndex(neighbors.length, rng)]

  board[firstIndex] = { id: 1, value: 1 }

  if (secondIndex !== undefined) {
    board[secondIndex] = { id: 2, value: 1 }
  }

  return {
    board,
    score: 0,
    moves: 0,
    status: 'playing',
    nextId: 3,
  }
}

export const isGameOver = (board: Array<Tile | null>): boolean => {
  if (board.some((tile) => tile === null)) return false

  for (let index = 0; index < board.length; index += 1) {
    const tile = board[index]
    if (!tile) continue

    const hasMatchingNeighbor = getAdjacentIndices(index).some(
      (neighborIndex) => board[neighborIndex]?.value === tile.value,
    )

    if (hasMatchingNeighbor) return false
  }

  return true
}

export const canMove = (
  state: GameState,
  from: number,
  to: number,
): boolean => {
  if (state.status !== 'playing' || !areAdjacent(from, to)) return false

  const source = state.board[from]
  const target = state.board[to]

  if (!source) return false

  return target === null || target?.value === source.value
}

export const applyMove = (
  state: GameState,
  from: number,
  to: number,
  rng: RandomSource = Math.random,
): MoveResult => {
  if (!canMove(state, from, to)) {
    return {
      state,
      moved: false,
      merged: false,
      gained: 0,
    }
  }

  const board = state.board.map((tile) => (tile ? { ...tile } : null))
  const source = board[from]
  const target = board[to]

  if (!source) {
    return {
      state,
      moved: false,
      merged: false,
      gained: 0,
    }
  }

  let merged = false
  let gained = 0

  if (target == null) {
    board[to] = source
    board[from] = null
  } else {
    const mergedValue = source.value * 2
    board[to] = {
      id: target.id,
      value: mergedValue,
    }
    board[from] = null
    merged = true
    gained = mergedValue
  }

  const nextId = spawnRandomTile(board, state.nextId, rng)

  const nextState: GameState = {
    board,
    score: state.score + gained,
    moves: state.moves + 1,
    status: isGameOver(board) ? 'game-over' : 'playing',
    nextId,
  }

  return {
    state: nextState,
    moved: true,
    merged,
    gained,
  }
}

export const highestTile = (board: Array<Tile | null>): number =>
  board.reduce((highest, tile) => Math.max(highest, tile?.value ?? 0), 0)
