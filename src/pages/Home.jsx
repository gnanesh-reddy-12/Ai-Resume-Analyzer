import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import UploadBox from "../components/UploadBox"
import JobDescription from "../components/JobDescription"
import PreviewCards from "../components/PreviewCards"

function Home() {
  return (
    <div className="min-h-screen bg-[#2F4F4F] relative overflow-hidden">

    <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-teal-400 rounded-full blur-[150px] opacity-10"></div>

    <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[150px] opacity-10"></div>
      
      <Navbar />

      <Hero />

      <UploadBox />

      <JobDescription />

      <PreviewCards />

    </div>
  )
}

export default Home