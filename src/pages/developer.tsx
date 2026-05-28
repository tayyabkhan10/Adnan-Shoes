export default function Developer(){
    return (
        <div>
            <div className="max-w-2xl mx-auto px-4 py-12 md:py-16 flex flex-col min-h-[calc(100vh-4rem)]">
        
        {/* Header Section */}
        <header className="text-center mb-10">
          <div className="relative inline-block">
            <img
              src="/images/img2.png"
              alt="Tayyab Khan"
              width={160}
              height={160}
              className="rounded-full border-4 border-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 object-cover"
              
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mt-6 mb-2 tracking-tight">
            Tayyab Khan
          </h1>
          <p className="text-lg md:text-xl text-blue-900 font-medium">
            Full Stack Developer
          </p>
        </header>

        {/* Main Content Card */}
        <article
          id="main-content"
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex-1"
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 relative inline-block">
            About Me
            <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-blue-900 rounded-full" />
          </h2>

          <div className="space-y-4 text-base md:text-lg leading-relaxed">
            <p>
              Hello! I&apos;m <strong className="text-slate-900">Tayyab Khan</strong>, a passionate{" "}
              <span className="text-blue-900 font-medium">Full Stack Developer</span> focused on building modern, scalable, and user-friendly web applications.
            </p>

            <p>
              I believe in writing clean, efficient, and maintainable code.{" "}
              <span className="bg-blue-50 text-slate-900 px-1.5 py-0.5 rounded font-semibold">
                This portfolio website is completely built from scratch
              </span>{" "}
              — no templates, no page builders, and no heavy frameworks. Every layout, animation, and interaction is handcrafted to ensure fast loading times and a seamless experience.
            </p>

            <p>
              I specialize in both frontend and backend technologies, turning complex problems into elegant digital solutions.
            </p>
          </div>

          {/* Badge */}
          <div className="mt-6">
            <span className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
              ✍️ 100% Hand-Coded from Scratch
            </span>
          </div>
        </article>

        
      </div>
        </div>
    )
}