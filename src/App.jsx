import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Loading from "./pages/Loading"
import Results from "./pages/Results"

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/loading" element={<Loading />} />

        <Route path="/results" element={<Results />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App