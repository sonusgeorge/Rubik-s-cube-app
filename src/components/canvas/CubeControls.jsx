import React, { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useCubeInteraction } from '../../hooks/useCubeInteraction.js'
import useCubeStore from '../../store/cubeStore.js'

/**
 * Invisible plane that captures pointer events for drag-to-rotate.
 * Also handles programmatic moves queued from the toolbar (scramble/solve).
 */
export default function CubeControls({ cubieRefs, orbitRef }) {
  const cubeGroupRef = useRef()
  const { scene } = useThree()

  // Attach to scene so getCubiesInLayer can find them
  useEffect(() => {
    cubeGroupRef.current = scene
  }, [scene])

  const { onPointerDown, onPointerUp, executeMove } = useCubeInteraction({
    cubeGroupRef,
    cubieRefs,
    orbitRef,
  })

  // Expose executeMove so toolbar can trigger moves
  // Store it on the cubeStore for external use
  const setExecuteMove = useCubeStore((s) => s.setExecuteMove)
  useEffect(() => {
    if (setExecuteMove) setExecuteMove(executeMove)
  }, [executeMove, setExecuteMove])

  return (
    <mesh
      visible={false}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <boxGeometry args={[3.5, 3.5, 3.5]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}
