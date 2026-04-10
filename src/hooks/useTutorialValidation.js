import { useCallback } from 'react'
import { useTutorialStore } from '../store/tutorialStore.js'

/**
 * Returns a `checkMove(moveName)` function that:
 * - Validates the move against the expected sequence when tutorial is active
 * - Returns 'correct' | 'wrong' | 'done' | 'free' (not in tutorial)
 */
export function useTutorialValidation() {
  const isActive = useTutorialStore((s) => s.isActive)
  const validateMove = useTutorialStore((s) => s.validateMove)

  const checkMove = useCallback(
    (moveName) => {
      if (!isActive) return 'free'
      return validateMove(moveName)
    },
    [isActive, validateMove]
  )

  return checkMove
}
