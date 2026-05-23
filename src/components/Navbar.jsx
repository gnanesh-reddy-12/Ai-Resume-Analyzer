function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-6">
      
      <h1 className="text-2xl font-bold text-white">
        ResumeAI
      </h1>

      <ul className="hidden md:flex gap-8 text-gray-300">
        <li className="hover:text-white cursor-pointer transition">
          Features
        </li>

        <li className="hover:text-white cursor-pointer transition">
          Dashboard
        </li>

        <li className="hover:text-white cursor-pointer transition">
          About
        </li>
      </ul>

      <button className="bg-white text-black px-5 py-2 rounded-full font-medium hover:scale-105 transition">
        Upload Resume
      </button>

    </nav>
  )
}

export default Navbar