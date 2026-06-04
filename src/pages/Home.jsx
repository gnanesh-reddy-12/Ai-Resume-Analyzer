import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import AnalyzeSection from "../components/AnalyzeSection"
import PreviewCards from "../components/PreviewCards"

function Home() {
  return (
    <div className="relative">

      <div
  className="relative min-h-screen overflow-hidden"
  style={{
    backgroundColor: "#ADD8E6"
  }}
>

        <Navbar />

        <Hero />

        <AnalyzeSection />

      </div>

      <div className="bg-white">
        <PreviewCards />
      </div>

    </div>
  )
}

export default Home 