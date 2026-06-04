function PreviewCards() {

  return (

    <section
      id="features"
      className="max-w-6xl mx-auto px-6 py-24"
    >

      {/* FEATURES */}

      <div className="grid md:grid-cols-2 gap-20 items-center">

        <div>

          <p className="text-blue-500 font-semibold uppercase tracking-widest">
            Features
          </p>

          <h2 className="text-5xl font-bold text-slate-900 mt-4 leading-tight">
            AI-Powered Resume Analysis
          </h2>

          <p className="text-slate-600 mt-6 text-lg leading-8">
            Analyze ATS compatibility, semantic skill alignment,
            keyword optimization, and hiring readiness using
            advanced AI technology.
          </p>

          <div className="space-y-10 mt-12">

            <div>

              <h3 className="text-2xl font-semibold text-slate-900">
                ATS Compatibility
              </h3>

              <p className="text-slate-600 mt-3">
                Understand how recruiters and ATS systems
                evaluate your resume.
              </p>

            </div>

            <div>

              <h3 className="text-2xl font-semibold text-slate-900">
                Semantic Matching
              </h3>

              <p className="text-slate-600 mt-3">
                Compare your skills and experience with
                target job requirements.
              </p>

            </div>

            <div>

              <h3 className="text-2xl font-semibold text-slate-900">
                Keyword Optimization
              </h3>

              <p className="text-slate-600 mt-3">
                Identify missing keywords that impact ATS scores.
              </p>

            </div>

            <div>

              <h3 className="text-2xl font-semibold text-slate-900">
                AI Suggestions
              </h3>

              <p className="text-slate-600 mt-3">
                Receive actionable recommendations to improve
                your resume instantly.
              </p>

            </div>

          </div>

        </div>

        {/* Dashboard Preview */}

        <div>

          <div className="bg-white rounded-[32px] shadow-xl p-8">

            <h3 className="text-2xl font-bold text-slate-900">
              Resume Insights
            </h3>

            <div className="space-y-8 mt-8">

              <div>

                <p className="text-slate-500">
                  ATS Compatibility
                </p>

                <div className="w-full bg-slate-200 rounded-full h-3 mt-2">
                  <div className="bg-blue-500 h-3 rounded-full w-[92%]"></div>
                </div>

              </div>

              <div>

                <p className="text-slate-500">
                  Semantic Match
                </p>

                <div className="w-full bg-slate-200 rounded-full h-3 mt-2">
                  <div className="bg-blue-500 h-3 rounded-full w-[88%]"></div>
                </div>

              </div>

              <div>

                <p className="text-slate-500">
                  Keyword Match
                </p>

                <div className="w-full bg-slate-200 rounded-full h-3 mt-2">
                  <div className="bg-blue-500 h-3 rounded-full w-[94%]"></div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* HOW IT WORKS */}

      <div
        id="how-it-works"
        className="mt-40 text-center"
      >

        <p className="text-blue-500 font-semibold uppercase tracking-widest">
          How It Works
        </p>

        <h2 className="text-5xl font-bold text-slate-900 mt-4">
          Simple. Fast. Effective.
        </h2>

        <div className="grid md:grid-cols-5 gap-10 mt-20">

          <div>
            <div className="text-6xl font-bold text-blue-500">1</div>
            <h3 className="mt-4 font-semibold text-xl">
              Upload Resume
            </h3>
          </div>

          <div>
            <div className="text-6xl font-bold text-blue-500">2</div>
            <h3 className="mt-4 font-semibold text-xl">
              Paste JD
            </h3>
          </div>

          <div>
            <div className="text-6xl font-bold text-blue-500">3</div>
            <h3 className="mt-4 font-semibold text-xl">
              AI Analysis
            </h3>
          </div>

          <div>
            <div className="text-6xl font-bold text-blue-500">4</div>
            <h3 className="mt-4 font-semibold text-xl">
              Get Results
            </h3>
          </div>

          <div>
            <div className="text-6xl font-bold text-blue-500">5</div>
            <h3 className="mt-4 font-semibold text-xl">
              Improve Resume
            </h3>
          </div>

        </div>

      </div>

      {/* RESULTS */}

      <div
        id="results"
        className="mt-40"
      >

        <p className="text-center text-blue-500 font-semibold uppercase tracking-widest">
          Live Preview
        </p>

        <h2 className="text-center text-5xl font-bold text-slate-900 mt-4">
          Detailed ATS Insights
        </h2>

        <div className="mt-16 bg-white rounded-[40px] shadow-xl p-12">

          <div className="grid md:grid-cols-2 gap-12">

            <div>

              <div className="w-56 h-56 mx-auto rounded-full border-[16px] border-blue-500 flex items-center justify-center">

                <div className="text-center">

                  <div className="text-6xl font-bold">
                    92%
                  </div>

                  <p className="text-slate-500">
                    ATS Score
                  </p>

                </div>

              </div>

            </div>

            <div>

              <div className="space-y-6">

                <div className="flex justify-between">
                  <span>Keyword Match</span>
                  <span>88%</span>
                </div>

                <div className="flex justify-between">
                  <span>Semantic Match</span>
                  <span>94%</span>
                </div>

                <div className="flex justify-between">
                  <span>Readiness Score</span>
                  <span>90%</span>
                </div>

              </div>

              <div className="mt-10">

                <h3 className="font-semibold text-xl">
                  Missing Skills
                </h3>

                <div className="flex gap-3 flex-wrap mt-4">

                  <span className="px-4 py-2 rounded-full bg-blue-100">
                    Docker
                  </span>

                  <span className="px-4 py-2 rounded-full bg-blue-100">
                    AWS
                  </span>

                  <span className="px-4 py-2 rounded-full bg-blue-100">
                    Kubernetes
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

  )
}

export default PreviewCards