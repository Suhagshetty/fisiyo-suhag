import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

import {
  Lightbulb,
  Users,
  MessageCircle,
  Microscope,
  Shield,
  ChevronRight,
  Twitter,
  Linkedin,
  Github,
  Mail,
} from "lucide-react";

const LandingPage2 = () => {
  const {
    isAuthenticated,
    isLoading,
    user: auth0User,
    loginWithRedirect,
  } = useAuth0();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (!isAuthenticated) {
      await loginWithRedirect({
        appState: { returnTo: "/post-login-check" },
      });
      return;
    }
 
    navigate("/post-login-check");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AD49E1]/5 via-white to-[#AD49E1]/5"> 
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-[#F0F0F0]/20 to-[#2EB171]/30 rounded-full blur-3xl"
          style={{
            animation: "blob 20s ease-in-out infinite",
            left: "0%",
            top: "30%",
          }}></div>
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-[#F0F0F0]/20 to-[#2EB171]/30 rounded-full blur-3xl"
          style={{
            animation: "blob 20s ease-in-out infinite",
            left: "80%",
            top: "60%",
          }}></div>
      </div>
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          25% {
            transform: translate(-300px, -200px) scale(1.1);
          }
          50% {
            transform: translate(0px, 0px) scale(1.2); /* meet here */
          }
          75% {
            transform: translate(300px, 200px) scale(1.1);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
      `}</style>
      <nav className="backdrop-blur-sm  sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-4">
              <span
                className="text-3xl font-extrabold tracking-wide text-[#12261D]"
                style={{ fontFamily: "Playfair Display, serif" }}>
                FISIYO
              </span>
            </div>
            <div className="flex items-center space-x-12">
              <button
                onClick={handleGetStarted}
                className="text-slate-800 font-normal cursor-pointer transition-colors text-lg tracking-wide border-b border-transparent pb-0.5"
                style={{ fontFamily: "Manrope, sans-serif" }}>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="py-32 lg:py-40">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1
              className="text-5xl sm:text-6xl lg:text-[100px] font-light text-[#12261D]  mb-12 leading-[0.95] tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}>
              Where{"  "}
              <span className="text-[#AD49E1] text-[60px] lg:text-[135px] font-extrabold">
                Innovation
              </span>{" "}
              Meets{" "}
              <span className="text-[#AD49E1] text-[60px] lg:text-[135px] font-extrabold">
                Expertise
              </span>
            </h1>
            <p
              className="text-xl text-black mb-16 max-w-3xl mx-auto leading-relaxed font-light tracking-wide"
              style={{ fontFamily: "Manrope, sans-serif" }}>
              Collaborate with Nobel laureates, industry leaders, and brilliant
              minds to accelerate research through our curated scientific
              network.
            </p>
          </div>
        </div>
      </section>
      {/* Key Features */}
      <section className="py-32 bg-white/60">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-24">
            <div
              className="inline-block text-[#AD49E1] text-sm font-light tracking-widest uppercase mb-8"
              style={{ fontFamily: "Manrope, sans-serif" }}>
              Scientific Excellence Platform
            </div>
            <h2
              className="text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}>
              Accelerate Discovery Through Collaboration
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              {
                icon: Lightbulb,
                title: "Hypothesis Validation",
                description:
                  "Rigorously test theories with peer-reviewed methodology frameworks",
                color: "[#AD49E1]",
              },
              {
                icon: Shield,
                title: "Secure IP Management",
                description:
                  "Blockchain-verified intellectual property protection system",
                color: "[#AD49E1]",
              },
              {
                icon: Users,
                title: "Elite Networks",
                description:
                  "Connect with top 1% researchers across 42 disciplines",
                color: "black",
              },
              {
                icon: MessageCircle,
                title: "Knowledge Exchange",
                description:
                  "Weekly masterclasses with field pioneers and industry partners",
                color: "[#AD49E1]",
              },
            ].map((feature, index) => (
              <div key={index} className="group text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-8 mx-auto transition-colors duration-500`}
                  style={{
                    backgroundColor: `${
                      feature.color === "[#AD49E1]" ? "#AD49E1" : "#AD49E1"
                    }10`,
                  }}>
                  <feature.icon
                    className="w-7 h-7"
                    style={{
                      color:
                        feature.color === "[#AD49E1]" ? "#AD49E1" : "#AD49E1",
                    }}
                    strokeWidth={1}
                  />
                </div>
                <h3
                  className="text-xl font-light text-slate-900 mb-4 tracking-wide"
                  style={{ fontFamily: "Playfair Display, serif" }}>
                  {feature.title}
                </h3>
                <p
                  className="text-slate-600 leading-relaxed font-light"
                  style={{ fontFamily: "Manrope, sans-serif" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* User Roles */}
      <section className="py-32 bg-gradient-to-b from-[#AD49E1]/5 to-[#AD49E1]/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-24">
            <div
              className="inline-block text-[#AD49E1] text-sm font-light tracking-widest uppercase mb-8"
              style={{ fontFamily: "Manrope, sans-serif" }}>
              Global Research Ecosystem
            </div>
            <h2
              className="text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}>
              Synergize With Excellence
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-16">
            {[
              {
                icon: Lightbulb,
                title: "Research Fellows",
                description:
                  "Post-docs and principal investigators leading breakthrough studies",
                features: [
                  "Access to $2.8B in funding",
                  "Lab equipment sharing",
                  "Patent support",
                ],
              },
              {
                icon: Microscope,
                title: "Industry Partners",
                description:
                  "Fortune 500 companies collaborating on applied research",
                features: [
                  "Early tech access",
                  "Talent pipeline",
                  "Co-research programs",
                ],
              },
              {
                icon: Shield,
                title: "Review Board",
                description:
                  "Nobel laureates and journal editors ensuring research quality",
                features: [
                  "Peer validation",
                  "Ethics oversight",
                  "Publication fast-track",
                ],
              },
            ].map((role, index) => (
              <div key={index} className="text-center group">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 transition-colors duration-500"
                  style={{ backgroundColor: "#AD49E120" }}>
                  <role.icon
                    className="w-9 h-9"
                    style={{ color: "#AD49E1" }}
                    strokeWidth={1}
                  />
                </div>
                <h3
                  className="text-2xl font-light text-slate-900 mb-6 tracking-wide"
                  style={{ fontFamily: "Playfair Display, serif" }}>
                  {role.title}
                </h3>
                <p
                  className="text-slate-600 mb-10 leading-relaxed font-light max-w-xs mx-auto"
                  style={{ fontFamily: "Manrope, sans-serif" }}>
                  {role.description}
                </p>
                <div className="space-y-3">
                  {role.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="text-slate-600 font-light text-sm"
                      style={{ fontFamily: "Manrope, sans-serif" }}>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="py-32 bg-gradient-to-b from-[#AD49E1]/8 to-[#AD49E1]/8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-16 border border-yellow-200/30">
            <h2
              className="text-4xl lg:text-5xl font-light text-slate-900 mb-8 tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}>
              Pioneer Tomorrow's Discoveries
            </h2>
            <p
              className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto font-light"
              style={{ fontFamily: "Manrope, sans-serif" }}>
              Join 142 Nobel laureates and 18,000 verified scientists shaping
              humanity's future.
            </p>
            <button
              onClick={handleGetStarted}
              className="text-slate-800 hover:text-slate-600 font-normal transition-colors text-lg tracking-wide border-b border-transparent hover:border-slate-300 pb-1"
              style={{ fontFamily: "Manrope, sans-serif" }}>
              Join Elite Network
            </button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-slate-50 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-8">
                <span
                  className="text-2xl font-light tracking-wide text-slate-800"
                  style={{ fontFamily: "Playfair Display, serif" }}>
                  FISIYO
                </span>
              </div>
              <p
                className="text-slate-500 max-w-md leading-relaxed mb-10 font-light"
                style={{ fontFamily: "Manrope, sans-serif" }}>
                Advancing human knowledge through collaborative excellence since
                2018.
              </p>
              <div className="flex space-x-4">
                {[Twitter, Linkedin, Github, Mail].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 bg-slate-200/50 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <Icon
                      className="w-4 h-4 text-slate-600"
                      strokeWidth={1.5}
                    />
                  </a>
                ))}
              </div>
            </div>

            {["Research", "Collaboration", "Resources"].map((category) => (
              <div key={category}>
                <h4
                  className="font-light mb-6 text-slate-800 tracking-wide"
                  style={{ fontFamily: "Manrope, sans-serif" }}>
                  {category}
                </h4>
                <ul
                  className="space-y-4 text-slate-500 font-light"
                  style={{ fontFamily: "Manrope, sans-serif" }}>
                  {["Funding Hub", "Mentorship", "Publications", "Events"].map(
                    (item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="hover:text-slate-700 transition-colors border-b border-transparent hover:border-slate-300 pb-0.5">
                          {item}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="border-t border-slate-200 pt-8 text-center text-slate-500 text-sm font-light"
            style={{ fontFamily: "Manrope, sans-serif" }}>
            <p>© 2025 FISIYO. Advancing scientific frontiers globally.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage2;
