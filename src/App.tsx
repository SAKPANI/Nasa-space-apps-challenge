import { HashRouter, Route, Routes } from "react-router-dom";
import { A11yProvider } from "./a11y/settings";
import { Layout } from "./components/Layout";
import { About } from "./pages/About";
import { Continents } from "./pages/Continents";
import { Explore } from "./pages/Explore";
import { Home } from "./pages/Home";
import { Library } from "./pages/Library";
import { ThemeProvider } from "./design/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <A11yProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/continents" element={<Continents />} />
              <Route path="/layers" element={<Library />} />
              <Route path="/about" element={<About />} />
            </Route>
          </Routes>
        </HashRouter>
      </A11yProvider>
    </ThemeProvider>
  );
}
