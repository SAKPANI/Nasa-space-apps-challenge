import { useEffect, useRef } from "react"
import { usePlayer } from "../audio/PlayerContext"

export function Visualizer() {
  const { waveform, playing } = usePlayer()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    let frame = 0
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const paint = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas.width !== Math.floor(width * ratio)) {
        canvas.width = Math.floor(width * ratio)
        canvas.height = Math.floor(height * ratio)
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)
      context.beginPath()
      context.strokeStyle = "#8DC63F"
      context.lineWidth = 1.5
      const data = playing ? waveform() : null
      if (!data) {
        context.moveTo(0, height / 2)
        context.lineTo(width, height / 2)
      } else {
        for (let index = 0; index < data.length; index += 2) {
          const x = (index / data.length) * width
          const y = (0.5 + data[index] * 0.45) * height
          if (index === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
      }
      context.stroke()
      if (!reduced) frame = requestAnimationFrame(paint)
    }
    frame = requestAnimationFrame(paint)
    return () => cancelAnimationFrame(frame)
  }, [playing, waveform])

  return <canvas ref={canvasRef} className="wave" role="img" aria-label="Onde du son en cours, en vert du logo" />
}
