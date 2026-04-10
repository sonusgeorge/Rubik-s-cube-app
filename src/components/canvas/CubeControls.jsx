import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useCubeInteraction } from '../../hooks/useCubeInteraction.js'
import useCubeStore from '../../store/cubeStore.js'

/**
 * R3F component that wires up pointer-based cube rotation.
 * No longer renders any visible or invisible geometry —
 * events are attached directly to gl.domElement (the canvas).
 *
 * Props:
 *   cubieRefs   — ref to array of cubie RoundedBox meshes (for raycasting)
 *   cubeGroupRef — ref to the <group> containing all 27 cubies (for re-parenting)
 *   orbitRef    — ref to OrbitControls (disabled while rotating)
 */
export default function CubeControls({ cubieRefs, cubeGroupRef, orbitRef }) {
  const { gl } = useThree()

  const { executeMove } = useCubeInteraction({
    cubeGroupRef,
    cubieRefs,
    orbitRef,
    domElement: gl.domElement,
  })

  // Register executeMove on the store so Toolbar can call it
  const setExecuteMove = useCubeStore((s) => s.setExecuteMove)
  useEffect(() => {
    if (setExecuteMove) setExecuteMove(executeMove)
  }, [executeMove, setExecuteMove])

  // No rendered output — events live on the canvas DOM element
  return null
}
