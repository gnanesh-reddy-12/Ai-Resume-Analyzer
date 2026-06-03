import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import UploadBox from "../components/UploadBox"
import JobDescription from "../components/JobDescription"
import PreviewCards from "../components/PreviewCards"
import background from "../assets/background.png"

function Home() {
  return (
    <div className="relative">

  {/* Hero Area */}
  <div
    className="relative"
    style={{
      backgroundImage: `url(${background})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
    <Navbar />
    <Hero />
    <UploadBox />
    <JobDescription />
  </div>

  {/* Rest of website */}
  <div className="bg-white">
    <PreviewCards />
  </div>

</div>
  )
}

export default Home