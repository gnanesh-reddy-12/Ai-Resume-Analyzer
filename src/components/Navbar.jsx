function Navbar() {
  return (
    <div className="px-6 pt-5">

      <nav className="max-w-6xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg">

        <h1 className="text-xl font-bold text-slate-900">
          ResumeAI
        </h1>

        <ul className="hidden md:flex gap-8 text-slate-700 font-medium">
          <li className="cursor-pointer hover:text-slate-900 transition">
            Features
          </li>

          <li className="cursor-pointer hover:text-slate-900 transition">
            Dashboard
          </li>

          <li className="cursor-pointer hover:text-slate-900 transition">
            About
          </li>
        </ul>

      </nav>

    </div>
  )
}

export default Navbar