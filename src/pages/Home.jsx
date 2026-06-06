import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import AnalyzeSection from "../components/AnalyzeSection"
import PreviewCards from "../components/PreviewCards"

function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <Hero />
      <AnalyzeSection />
      <PreviewCards />
    </div>
  )
}

export default Home