import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

type A11yValue = {
  contrast: boolean
  font: number
  speech: boolean
  haptics: boolean
  setContrast: (value: boolean) => void
  setFont: (value: number) => void
  setSpeech: (value: boolean) => void
  setHaptics: (value: boolean) => void
}

const A11yContext = createContext<A11yValue | null>(null)

export function A11yProvider({ children }: { children: ReactNode }) {
  const [contrast, setContrast] = useState(false)
  const [font, setFont] = useState(1)
  const [speech, setSpeech] = useState(false)
  const [haptics, setHaptics] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("contrast", contrast)
    document.documentElement.style.fontSize = `${16 * font}px`
  }, [contrast, font])

  const value = useMemo(
    () => ({ contrast, font, speech, haptics, setContrast, setFont, setSpeech, setHaptics }),
    [contrast, font, speech, haptics],
  )
  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>
}

export function useA11y(): A11yValue {
  const value = useContext(A11yContext)
  if (!value) throw new Error("Réglages d'accessibilité indisponibles.")
  return value
}
