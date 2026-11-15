import { Outlet, useLocation } from "react-router-dom"
import { Header } from "./Header"
import { SiteFooter } from "./SiteFooter"
import TargetCursor from "./TargetCursor"
import ClickSpark from "./ClickSpark"

export function Layout() {
  const { pathname } = useLocation()
  const gate = pathname === "/"
  const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <ClickSpark
      sparkColor={["#FFCE00", "#66CBAA", "#1E88C9", "#FFFFFF"]}
      sparkCount={8}
      sparkSize={6}
      duration={300}
      disabled={isReduced}
    >
      {!isReduced && (
        <TargetCursor
          targetSelector="button, a, .btn, .interactive, [role='button'], input, select"
          cursorColor="#FFCE00"
          size={32}
          cornerSize={10}
          thickness={2}
          parallaxOn={true}
          hideDefaultCursor={false}
          showLabel={false}
        />
      )}
      <a className="skip" href="#contenu">Skip to content</a>
      <Header />
      <main id="contenu" className={gate ? "page" : "shell page"}>
        <Outlet />
      </main>
      <SiteFooter />
    </ClickSpark>
  )
}
