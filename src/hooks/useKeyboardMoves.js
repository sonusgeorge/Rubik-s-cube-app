import { useEffect } from 'react'
import useCubeStore from '../store/cubeStore.js'

const MOVE_KEYS = new Set(['R', 'L', 'U', 'D', 'F', 'B', 'M', 'E', 'S'])

/**
 * Keyboard move input: press a face/slice letter to turn it clockwise,
 * hold Shift for counter-clockwise (e.g. r → R, Shift+r → R').
 * Ignores key presses with Ctrl/Alt/Meta and presses inside form fields.
 */
export function useKeyboardMoves() {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return

      const letter = e.key.toUpperCase()
      if (!MOVE_KEYS.has(letter)) return

      const executeMove = useCubeStore.getState().executeMove
      if (!executeMove) return
      e.preventDefault()
      executeMove(e.shiftKey ? `${letter}'` : letter)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
