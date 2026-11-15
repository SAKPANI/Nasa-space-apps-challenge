import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { LinearSRGBColorSpace, NoToneMapping, Color } from "three"
import { GlobeScene, type SceneProps } from "./GlobeScene"

export default function GlobeCanvas(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.7, 5.6], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#05070d", 1)
        scene.background = new Color("#05070d")
        gl.outputColorSpace = LinearSRGBColorSpace
        gl.toneMapping = NoToneMapping
      }}
    >
      <Suspense fallback={null}>
        <GlobeScene {...props} />
      </Suspense>
    </Canvas>
  )
}
