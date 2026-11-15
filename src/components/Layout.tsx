import { Outlet, useLocation } from "react-router-dom"
import { Header } from "./Header"
import { SiteFooter } from "./SiteFooter"

export function Layout() {
  const { pathname } = useLocation()
  const gate = pathname === "/"
  return (
    <>
      <a className="skip" href="#contenu">Skip to content</a>
      <Header />
      <main id="contenu" className={gate ? "page" : "shell page"}>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}
