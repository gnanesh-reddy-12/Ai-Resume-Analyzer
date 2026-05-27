import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import UploadBox from "../components/UploadBox"
import JobDescription from "../components/JobDescription"

function Home() {
  return (
    <div className="min-h-screen bg-[#2F4F4F] relative overflow-hidden">

      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-20"></div>

      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20"></div>

      <Navbar />

      <Hero />

      <UploadBox />

      <JobDescription />

    </div>
  )
}

export default Home