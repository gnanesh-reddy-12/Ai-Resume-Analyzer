function Navbar() {
  return (
    <div className="px-6 pt-5">

      <nav
        className="
        liquid-navbar
        max-w-5xl
        mx-auto
        rounded-full
        px-8
        py-4
        flex
        items-center
        justify-between
        "
      >
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Resume
          <span className="text-cyan-500 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
            AI
          </span>
        </h1>

        <div className="flex items-center gap-8">

          <ul className="hidden md:flex gap-3 font-medium">

            <li>
              <a
                href="#features"
                className="
                px-4 py-2
                rounded-full
                text-white
                hover:bg-white/15
                hover:backdrop-blur-md
                hover:text-slate-900
                transition-all
                duration-300
                "
              >
                Features
              </a>
            </li>

            <li>
              <a
                href="#how-it-works"
                className="
                px-4 py-2
                rounded-full
                text-white
                hover:bg-white/15
                hover:backdrop-blur-md
                hover:text-slate-900
                transition-all
                duration-300
                "
              >
                How It Works
              </a>
            </li>

            <li>
              <a
                href="#results"
                className="
                px-4 py-2
                rounded-full
                text-white
                hover:bg-white/15
                hover:backdrop-blur-md
                hover:text-slate-900
                transition-all
                duration-300
                "
              >
                Results
              </a>
            </li>

            <li>
              <a
                href="https://github.com/gnanesh-reddy-12/Ai-Resume-Analyzer"
                target="_blank"
                rel="noreferrer"
                className="
                px-4 py-2
                rounded-full
                text-white
                hover:bg-white/15
                hover:backdrop-blur-md
                hover:text-slate-900
                transition-all
                duration-300
                "
              >
                GitHub
              </a>
            </li>

          </ul>

          <a
            href="#upload"
            className="
            px-6 py-3
            rounded-full

            bg-white/25
            backdrop-blur-md

            border border-white/30

            text-slate-900
            font-semibold

            hover:bg-white/35

            transition-all
            duration-300
            "
          >
            Get Started
          </a>

        </div>

      </nav>

    </div>
  )
}

export default Navbar