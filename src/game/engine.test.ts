import { describe, expect, it } from 'vitest'
import {
  CELL_COUNT,
  GRID_COLUMNS,
  applyMove,
  areAdjacent,
  createGame,
  isGameOver,
  type GameState,
  type Tile,
} from './engine'

const stateWith = (entries: Array<[number, number]>): GameState => {
  const board: Array<Tile | null> = Array.from({ length: CELL_COUNT }, () => null)

  entries.forEach(([index, value], id) => {
    board[index] = { id: id + 1, value }
  })

  return {
    board,
    score: 0,
    moves: 0,
    status: 'playing',
    nextId: entries.length + 1,
  }
}

describe('Merge24 engine', () => {
  it('starts with two adjacent tiles valued 1', () => {
    const game = createGame(() => 0)

    const occupied = game.board
      .map((tile, index) => (tile ? index : -1))
      .filter((index) => index >= 0)

    expect(occupied).toHaveLength(2)
    expect(game.board[occupied[0] ?? 0]?.value).toBe(1)
    expect(game.board[occupied[1] ?? 0]?.value).toBe(1)
    expect(areAdjacent(occupied[0] ?? -1, occupied[1] ?? -1)).toBe(true)
  })

  it('merges equal adjacent tiles and adds the merged value to score', () => {
    const result = applyMove(stateWith([[0, 1], [1, 1]]), 0, 1, () => 0)

    expect(result.moved).toBe(true)
    expect(result.merged).toBe(true)
    expect(result.gained).toBe(2)
    expect(result.state.score).toBe(2)
    expect(result.state.board[1]?.value).toBe(2)
    expect(result.state.board.filter(Boolean)).toHaveLength(2)
  })

  it('moves into an adjacent empty cell and spawns a new tile', () => {
    const result = applyMove(stateWith([[0, 1]]), 0, GRID_COLUMNS, () => 0)

    expect(result.moved).toBe(true)
    expect(result.merged).toBe(false)
    expect(result.state.board[GRID_COLUMNS]?.value).toBe(1)
    expect(result.state.board.filter(Boolean)).toHaveLength(2)
  })

  it('rejects diagonal moves', () => {
    const result = applyMove(stateWith([[0, 1]]), 0, GRID_COLUMNS + 1, () => 0)

    expect(result.moved).toBe(false)
    expect(result.state.moves).toBe(0)
  })

  it('detects game over only when the full board has no matching neighbors', () => {
    const board: Array<Tile | null> = Array.from({ length: CELL_COUNT }, (_, index) => {
      const row = Math.floor(index / GRID_COLUMNS)
      const column = index % GRID_COLUMNS

      return {
        id: index + 1,
        value: (row + column) % 2 === 0 ? 1 : 2,
      }
    })

    expect(isGameOver(board)).toBe(true)

    board[1] = { id: 2, value: 1 }
    expect(isGameOver(board)).toBe(false)

    board[1] = null
    expect(isGameOver(board)).toBe(false)
  })
})
