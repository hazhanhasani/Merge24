import './style.css'
import {
  applyMove,
  createGame,
  highestTile,
  type GameState,
} from './game/engine'

const BEST_SCORE_KEY = 'merge24.bestScore'

const app = document.querySelector<HTMLElement>('#app')
if (!app) throw new Error('Merge24 root element was not found.')

let state: GameState = createGame()
let selectedIndex: number | null = null
let dragOrigin: number | null = null
let dragTarget: number | null = null
let dragStart = { x: 0, y: 0 }
let dragging = false
let suppressNextClick = false
let lastMessage = 'دو عدد ۱ کنار هم هستند؛ یکی را روی دیگری بکش.'

const readBestScore = (): number => {
  try {
    const parsed = Number.parseInt(localStorage.getItem(BEST_SCORE_KEY) ?? '0', 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  } catch {
    return 0
  }
}

let bestScore = readBestScore()

const saveBestScore = (): void => {
  if (state.score <= bestScore) return

  bestScore = state.score

  try {
    localStorage.setItem(BEST_SCORE_KEY, String(bestScore))
  } catch {
    // Storage is optional; gameplay must continue without it.
  }
}

const levelClass = (value: number): string => {
  const level = Math.min(12, Math.floor(Math.log2(Math.max(1, value))) + 1)
  return 'level-' + level
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('fa-IR').format(value)

const render = (): void => {
  const maxTile = highestTile(state.board)

  const cells = state.board
    .map((tile, index) => {
      const selected = selectedIndex === index ? ' is-selected' : ''
      const label = tile
        ? 'خانه ' + (index + 1) + '، عدد ' + tile.value
        : 'خانه ' + (index + 1) + '، خالی'

      const content = tile
        ? '<span class="tile ' +
          levelClass(tile.value) +
          '" data-value="' +
          tile.value +
          '"><strong>' +
          formatNumber(tile.value) +
          '</strong></span>'
        : '<span class="empty-dot" aria-hidden="true"></span>'

      return (
        '<button class="cell' +
        selected +
        '" type="button" role="gridcell" data-cell-index="' +
        index +
        '" aria-label="' +
        label +
        '" aria-pressed="' +
        (selectedIndex === index) +
        '">' +
        content +
        '</button>'
      )
    })
    .join('')

  const gameOverMarkup =
    state.status === 'game-over'
      ? '<div class="game-over" role="dialog" aria-modal="true" aria-labelledby="game-over-title">' +
        '<div class="game-over-card">' +
        '<span class="game-over-icon" aria-hidden="true">◆</span>' +
        '<h2 id="game-over-title">بازی تمام شد</h2>' +
        '<p>همه ۲۴ خانه پر شده‌اند و هیچ عدد یکسانی کنار هم نیست.</p>' +
        '<dl>' +
        '<div><dt>امتیاز</dt><dd>' +
        formatNumber(state.score) +
        '</dd></div>' +
        '<div><dt>حرکت</dt><dd>' +
        formatNumber(state.moves) +
        '</dd></div>' +
        '<div><dt>بالاترین عدد</dt><dd>' +
        formatNumber(maxTile) +
        '</dd></div>' +
        '</dl>' +
        '<button class="primary-button" type="button" data-action="new-game">دوباره بازی کن</button>' +
        '</div></div>'
      : ''

  app.innerHTML =
    '<section class="game-shell">' +
    '<header class="topbar">' +
    '<div class="brand">' +
    '<span class="brand-mark" aria-hidden="true">M24</span>' +
    '<div><h1>Merge24</h1><p>ادغام کن، جا باز کن، رکورد بزن.</p></div>' +
    '</div>' +
    '<button class="icon-button" type="button" data-action="new-game" aria-label="شروع بازی جدید">↻</button>' +
    '</header>' +
    '<section class="stats" aria-label="آمار بازی">' +
    '<article><span>امتیاز</span><strong>' +
    formatNumber(state.score) +
    '</strong></article>' +
    '<article><span>رکورد</span><strong>' +
    formatNumber(bestScore) +
    '</strong></article>' +
    '<article><span>بالاترین</span><strong>' +
    formatNumber(maxTile) +
    '</strong></article>' +
    '</section>' +
    '<div class="status-line"><span class="status-dot" aria-hidden="true"></span><p>' +
    lastMessage +
    '</p></div>' +
    '<section class="board-frame">' +
    '<div class="board" role="grid" aria-label="صفحه ۲۴ خانه‌ای Merge24">' +
    cells +
    '</div>' +
    gameOverMarkup +
    '</section>' +
    '<footer class="game-help">' +
    '<span>' +
    formatNumber(state.moves) +
    ' حرکت</span>' +
    '<p>روی یک مهره بزن و خانه مجاور را انتخاب کن، یا مستقیم بکش. خانه خالی = حرکت؛ عدد مساوی = ادغام.</p>' +
    '</footer>' +
    '</section>'
}

const newGame = (): void => {
  state = createGame()
  selectedIndex = null
  dragOrigin = null
  dragTarget = null
  dragging = false
  lastMessage = 'بازی جدید شروع شد. دو عدد ۱ را با هم ادغام کن.'
  render()
}

const commitMove = (from: number, to: number): boolean => {
  const result = applyMove(state, from, to)

  if (!result.moved) {
    lastMessage = 'فقط به خانه مجاور خالی یا عدد مساوی می‌توانی حرکت کنی.'
    render()
    return false
  }

  state = result.state
  selectedIndex = null

  if (result.merged) {
    lastMessage = '+' + formatNumber(result.gained) + ' امتیاز! ادغام عالی بود.'
  } else {
    lastMessage = 'حرکت انجام شد؛ یک مهره جدید وارد صفحه شد.'
  }

  saveBestScore()

  if (state.status === 'game-over') {
    lastMessage = 'فضای خالی و جفت مجاور دیگری باقی نمانده.'
  }

  render()
  return true
}

const cellIndexFromElement = (element: Element | null): number | null => {
  const cell = element?.closest<HTMLElement>('[data-cell-index]')
  if (!cell) return null

  const index = Number.parseInt(cell.dataset.cellIndex ?? '', 10)
  return Number.isInteger(index) ? index : null
}

const clearPointerClasses = (): void => {
  app.querySelectorAll('.is-dragging, .is-drop-target').forEach((element) => {
    element.classList.remove('is-dragging', 'is-drop-target')
  })
}

app.addEventListener('click', (event) => {
  if (suppressNextClick) {
    suppressNextClick = false
    return
  }

  const target = event.target as Element
  const action = target.closest<HTMLElement>('[data-action]')?.dataset.action

  if (action === 'new-game') {
    newGame()
    return
  }

  if (state.status !== 'playing') return

  const index = cellIndexFromElement(target)
  if (index === null) return

  const tile = state.board[index]

  if (selectedIndex === null) {
    if (tile) {
      selectedIndex = index
      lastMessage = 'حالا یک خانه مجاور را انتخاب کن.'
      render()
    }
    return
  }

  if (selectedIndex === index) {
    selectedIndex = null
    lastMessage = 'انتخاب لغو شد.'
    render()
    return
  }

  const moved = commitMove(selectedIndex, index)

  if (!moved && tile) {
    selectedIndex = index
    lastMessage = 'این مهره انتخاب شد؛ مقصد مجاور را انتخاب کن.'
    render()
  }
})

app.addEventListener('pointerdown', (event) => {
  if (state.status !== 'playing') return

  const target = event.target as Element
  const index = cellIndexFromElement(target)

  if (index === null || !state.board[index]) return

  dragOrigin = index
  dragTarget = index
  dragStart = { x: event.clientX, y: event.clientY }
  dragging = false

  target.closest<HTMLElement>('[data-cell-index]')?.classList.add('is-dragging')
})

app.addEventListener('pointermove', (event) => {
  if (dragOrigin === null) return

  const distance = Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y)
  if (distance < 8) return

  dragging = true

  const hovered = document.elementFromPoint(event.clientX, event.clientY)
  const index = cellIndexFromElement(hovered)

  if (index === null) return

  dragTarget = index

  app.querySelectorAll('.is-drop-target').forEach((element) => {
    element.classList.remove('is-drop-target')
  })

  if (index !== dragOrigin) {
    app
      .querySelector<HTMLElement>('[data-cell-index="' + index + '"]')
      ?.classList.add('is-drop-target')
  }
})

const finishPointer = (): void => {
  if (dragOrigin === null) return

  const origin = dragOrigin
  const target = dragTarget
  const wasDragging = dragging

  dragOrigin = null
  dragTarget = null
  dragging = false
  clearPointerClasses()

  if (!wasDragging) return

  suppressNextClick = true

  if (target !== null && target !== origin) {
    commitMove(origin, target)
    return
  }

  lastMessage = 'مهره را روی یکی از خانه‌های مجاور رها کن.'
  render()
}

app.addEventListener('pointerup', finishPointer)
app.addEventListener('pointercancel', finishPointer)

render()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Offline install is optional.
    })
  })
}
