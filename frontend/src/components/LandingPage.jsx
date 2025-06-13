import { useState } from "react";
import {
  Star,
  Award,
  Trophy,
  Users,
  Lightbulb,
  Globe,
  Shield,
  Rocket,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";


import "../styles/CustomFonts.css";
import "../styles/animations.css";
import "../styles/space-background.css";

const LandingPage = () => {
  const [isExploded, setIsExploded] = useState(false);

   
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

  const handlePlanetClick = () => {
    setIsExploded(true);
    setTimeout(() => {
      setIsExploded(false);
    }, 2000);
  };

  const communityCards = [
    {
      title: "Quantum Physics",
      subtitle: "Dive into Quantum Realms",
      image: "https://images.pexels.com/photos/355906/pexels-photo-355906.jpeg?auto=compress&cs=tinysrgb&w=400",
      color: "from-blue-500 to-purple-600",
      shadowColor: "shadow-blue-500/50",
    },
    {
      title: "Organic Chemistry",
      subtitle: "The Language of Carbon",
      image: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400",
      color: "from-green-500 to-teal-600",
      shadowColor: "shadow-green-500/50",
    },
    {
      title: "Neuroscience Insights",
      subtitle: "The Inner Workings of Thought",
      image: "https://images.pexels.com/photos/3825585/pexels-photo-3825585.jpeg?auto=compress&cs=tinysrgb&w=400",
      color: "from-pink-500 to-rose-600",
      shadowColor: "shadow-pink-500/50",
    },
    {
      title: "Cosmology & Stars",
      subtitle: "Galaxies in Motion",
      image: "https://images.pexels.com/photos/1114900/pexels-photo-1114900.jpeg?auto=compress&cs=tinysrgb&w=400",
      color: "from-purple-500 to-indigo-600",
      shadowColor: "shadow-purple-500/50",
    },
    {
      title: "AI & Machine Learning",
      subtitle: "The Mind of the Machine",
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400",
      color: "from-cyan-500 to-blue-600",
      shadowColor: "shadow-cyan-500/50",
    },
    {
      title: "Astronomy",
      subtitle: "Beyond the Sky: Stars & Planets",
      image: "https://images.pexels.com/photos/12498677/pexels-photo-12498677.jpeg?auto=compress&cs=tinysrgb&w=400",
      color: "from-orange-500 to-red-600",
      shadowColor: "shadow-orange-500/50",
    },
    {
      title: "Robotics",
      subtitle: "Engineering the Future of Automation",
      image: "https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=400",
      color: "from-gray-500 to-slate-600",
      shadowColor: "shadow-gray-500/50",
    },
    {
      title: "Biotechnology",
      subtitle: "Innovation at the Cellular Level",
      image: "https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400",
      color: "from-emerald-500 to-green-600",
      shadowColor: "shadow-emerald-500/50",
    },
    {
      title: "Mathematical Models",
      subtitle: "Simulating the Logic of the Universe",
      image: "https://images.pexels.com/photos/6256065/pexels-photo-6256065.jpeg?auto=compress&cs=tinysrgb&w=400",
      color: "from-yellow-500 to-orange-600",
      shadowColor: "shadow-yellow-500/50",
    },
    {
      title: "Nanotechnology",
      subtitle: "Manipulating Matter Atom by Atom",
      image: "https://images.pexels.com/photos/2280568/pexels-photo-2280568.jpeg?auto=compress&cs=tinysrgb&w=400",
      color: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/50",
    },
    {
      title: "Astrobiology",
      subtitle: "Life Among the Stars",
      image: "https://images.pexels.com/photos/23547/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400",
      color: "from-teal-500 to-cyan-600",
      shadowColor: "shadow-teal-500/50",
    },
  ];
  const heightClass = (index) => {
    const pattern = [
      "h-64",
      "h-72",
      "h-80",
      "h-64",
      "h-96",
      "h-64",
      "h-80",
      "h-72",
      "h-64",
      "h-96",
      "h-72",
    ];
    return pattern[index % pattern.length];
  };
  

  return (
    <div className="min-h-screen text-white font-sans relative">
      {/* Space Background */}
      <div className="space-background"></div>
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <div className="absolute top-7 left-7 text-6xl text-white font-[Orbitron]">
        FISIYO
      </div>

      {/* Hero Section */}
      <section className="text-center px-8 py-24 max-w-6xl mx-auto relative min-h-screen flex flex-col justify-center">
        {/* Scattered SVGs (Positioned & Responsive) */}
        {/* <img
          src="/images/astronaut.png"
          className="absolute left-1/2 top-[6vh] w-[min(20vw,100px)] h-auto -translate-x-1/2 floating-2"
        /> */}
        {/* <div className="absolute top-[5.5vh] right-[7%] w-[min(10vw,54px)] h-[min(8vh,44px)] floating-3" />
        <div className="absolute top-[14vh] right-[5%] w-[min(6vw,28px)] h-[min(6vw,28px)] floating-4" />
        <div className="absolute top-[18vh] left-[43%] w-[min(6vw,29px)] h-[min(6vw,29px)] -translate-x-1/2 floating-5" /> */}

        {/* Main Content */}
        <div className="relative z-10 mt-35">
          {/* Floating SVGs around the heading */}
          <img
            src="https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/240_F_1302724318_uQ0xukXtVUpQyYGZaRyyPmZwdkQ04F9t-removebg-preview.png"
            className="absolute right-[15%] bottom-[86%] w-[min(220px)] h-auto floating-3"
          />
          <img
            src="https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/1749392597204-image-removebg-preview%20(1).png"
            className="absolute bottom-[40%] left-[5%] w-[min(300px)] -z-1 h-auto floating-4"
          />
          {/* <img
            src="https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/1749394050888-image-removebg-preview%20(2).png"
            className="absolute bottom-[10%] right-[20%] w-[min(120px)] h-auto floating-5"
          /> */}
          <img
            src="https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/1749391137571-vecteezy_serene-rustic-a-visualization-of-quantum-entanglement-authentic_60335092.png"
            className="absolute bottom-[35%] right-[15%] w-[min(150px)] h-auto floating-5"
          />
          <img
            src="https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/10145465.png"
            className="absolute bottom-[82%] left-[10%] -z-1 w-[min(250px)] h-auto transform scale-x-[-1] rotate-[25deg] floating-5"
          />

          {/* Main Heading */}
          <h1 className="font-serif text-4xl md:text-4xl lg:text-5xl xl:text-7xl mb-8 leading-[1.1] italic font-light tracking-wide text-white">
            Where <em className="font-medium">Curiosity</em>
            <br />
            <em className="font-medium">Fuels Collaboration!</em>
          </h1>

          {/* Subtext */}
          <div className="max-w-4xl mx-auto mb-16">
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed font-light italic tracking-wide text-gray-200">
              Think. Share. Grow. Together.
            </p>
          </div>

          {/* Get Started Button */}
          <div className="mb-7">
            <button
              onClick={handleGetStarted}
              className="font-serif italic text-xl px-18 py-5 border rounded-xl text-white relative hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: "transparent",
                borderColor: "transparent",
                boxShadow: "4px 4px 0 rgba(192, 132, 252, 0.3)",
              }}>
              Get Started
            </button>
          </div>

          {/* Scroll Down Rocket */}
          <div
            onClick={() =>
              document
                .getElementById("unlock-potential")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-20 flex justify-center items-center cursor-pointer animate-bounce">
            <Rocket className="w-10 h-10 text-white drop-shadow-md transform rotate-[135deg]" />
          </div>
        </div>
      </section>

      {/* Enhanced Unlock Your Potential Section with Interactive Solar System */}
      <section
        id="unlock-potential"
        className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-10 relative z-10">
        {/* Interactive Solar System */}
        <div className="relative md:w-2/3 w-full h-[700px] rounded-xl flex items-center justify-center ">
          {/* Central Sun - Clickable */}
          <div
            className="absolute w-24 h-24 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 rounded-full shadow-2xl z-20 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300"
            onClick={handlePlanetClick}>
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-200 via-orange-300 to-red-400 rounded-full animate-pulse">
              <div className="w-full h-full bg-gradient-to-br from-yellow-100 via-orange-200 to-red-300 rounded-full animate-spin-slow opacity-80" />
            </div>
            {/* Sun's glow effect */}
            <div className="absolute inset-0 w-32 h-32 -m-4 bg-gradient-to-br from-yellow-300/30 via-orange-400/20 to-red-500/10 rounded-full blur-xl animate-pulse" />
          </div>

          {/* Orbital Paths - Only these move */}
          <div
            className="absolute w-[300px] h-[220px] border border-blue-300/30 rounded-[50%] animate-spin-slow"
            style={{ animationDuration: "40s" }}
          />
          <div
            className="absolute w-[420px] h-[300px] border border-purple-300/30 rounded-[50%] animate-spin-reverse"
            style={{ animationDuration: "60s" }}
          />
          <div
            className="absolute w-[550px] h-[400px] border border-cyan-300/30 rounded-[50%] animate-spin-slow"
            style={{ animationDuration: "80s" }}
          />
          <div
            className="absolute w-[680px] h-[500px] border border-green-300/30 rounded-[50%] animate-spin-reverse"
            style={{ animationDuration: "100s" }}
          />

          {/* Static Feature Cards with Pop-out Animation */}
          {/* Card 1 - XP & Levels */}
          <div
            className={`absolute top-[8%] left-[20%] transition-all duration-1000 ease-out ${
              isExploded
                ? "transform scale-125 -translate-x-20 -translate-y-10"
                : ""
            }`}>
            <div className="w-56 h-56 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl flex flex-col justify-center items-center text-center p-6 border border-white/50">
              <Star className="text-blue-600 mb-3" size={40} />
              <h4 className="font-semibold text-lg text-gray-800">
                XP & Levels
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                Earn experience points and level up through scientific
                achievements
              </p>
            </div>
          </div>

          {/* Card 2 - Streaks & Challenges */}
          <div
            className={`absolute top-[55%] left-[5%] transition-all duration-1000 ease-out ${
              isExploded
                ? "transform scale-125 -translate-x-16 translate-y-8"
                : ""
            }`}>
            <div className="w-56 h-56 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl flex flex-col justify-center items-center text-center p-6 border border-white/50">
              <Trophy className="text-red-600 mb-3" size={40} />
              <h4 className="font-semibold text-lg text-gray-800">
                Streaks & Challenges
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                Maintain learning streaks and complete daily science challenges
              </p>
            </div>
          </div>

          {/* Card 3 - Badges & Leaderboards */}
          <div
            className={`absolute top-[70%] left-[60%] transition-all duration-1000 ease-out ${
              isExploded
                ? "transform scale-125 translate-x-20 translate-y-12"
                : ""
            }`}>
            <div className="w-56 h-56 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl flex flex-col justify-center items-center text-center p-6 border border-white/50">
              <Award className="text-green-600 mb-3" size={40} />
              <h4 className="font-semibold text-lg text-gray-800">
                Badges & Leaderboards
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                Unlock achievements and compete with fellow researchers
              </p>
            </div>
          </div>

          {/* Card 4 - Communities */}
          <div
            className={`absolute top-[25%] left-[65%] transition-all duration-1000 ease-out ${
              isExploded
                ? "transform scale-125 translate-x-16 -translate-y-8"
                : ""
            }`}>
            <div className="w-56 h-56 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl flex flex-col justify-center items-center text-center p-6 border border-white/50">
              <Users className="text-purple-600 mb-3" size={40} />
              <h4 className="font-semibold text-lg text-gray-800">
                Communities
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                Join vibrant scientific communities and collaborate globally
              </p>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="md:w-1/3 w-full text-left">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Unlock Your Potential Through Your Posts
          </h2>
          <p className="text-gray-300 text-lg">
            Fisiyo combines the thrill of gamification with the depth of
            scientific exploration. Click the sun to see our features explode
            into action!
          </p>
        </div>
      </section>

      {/* Explore Vibrant Science Communities */}
      <section className="w-full py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-4xl font-bold mb-10 text-white">
            Explore Vibrant Science Communities
          </h2>
          <p className="text-center text-gray-200 max-w-4xl mx-auto font-semibold mb-12">
            Connect with fellow enthusiastic accelerators fields of science.
          </p>
        </div>

        {/* Masonry Grid Layout */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {communityCards.map((card, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl hover:transform hover:scale-105 transition-all duration-300 ${
                  card.shadowColor
                } shadow-xl hover:shadow-2xl ${
                  index % 7 === 0
                    ? "md:col-span-2 h-80"
                    : index % 5 === 0
                    ? "lg:row-span-2 h-96"
                    : index % 3 === 0
                    ? "h-72"
                    : "h-64"
                }`}>
                {/* Image that covers entire card */}
                <img
                  src={card.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${card.color} opacity-80 group-hover:opacity-70 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h4 className="text-xl font-bold mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {card.title}
                  </h4>
                  <p className="text-sm opacity-90 mb-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {card.subtitle}
                  </p>
                  <button className="self-start px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold hover:bg-white/30 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 delay-150">
                    Join Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
            Explore All
          </button>
        </div>
      </section>

      {/* New Synergize With Excellence Section */}
      <section className="w-full py-20 bg-gradient-to-br from-purple-900/90 to-black/90 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-sm uppercase tracking-wider text-purple-300 mb-4">
              GLOBAL RESEARCH ECOSYSTEM
            </h3>
            <h2 className="text-5xl font-bold text-white mb-8">
              Synergize With Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Research Fellows */}
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Research Fellows
              </h3>
              <p className="text-gray-300 mb-8">
                Post-docs and principal investigators leading breakthrough
                studies
              </p>
              <div className="space-y-4 text-gray-400">
                <p>Access to $2.8B in funding</p>
                <p>Lab equipment sharing</p>
                <p>Patent support</p>
              </div>
            </div>

            {/* Industry Partners */}
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Globe className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Industry Partners
              </h3>
              <p className="text-gray-300 mb-8">
                Fortune 500 companies collaborating on applied research
              </p>
              <div className="space-y-4 text-gray-400">
                <p>Early tech access</p>
                <p>Talent pipeline</p>
                <p>Co-research programs</p>
              </div>
            </div>

            {/* Review Board */}
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Review Board
              </h3>
              <p className="text-gray-300 mb-8">
                Nobel laureates and journal editors ensuring research quality
              </p>
              <div className="space-y-4 text-gray-400">
                <p>Peer validation</p>
                <p>Ethics oversight</p>
                <p>Publication fast-track</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Footer Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-8">
            <img
              src="/logo192.png"
              alt="Fisiyo Logo"
              className="w-12 h-12 mb-4 mx-auto"
            />
            <h3 className="text-2xl font-semibold text-white">Fisiyo</h3>
          </div>
          <h4 className="text-xl font-medium mb-4 text-gray-200">
            Stay tuned for exciting scientific discoveries, community events,
            and exclusive challenges.
          </h4>
          <div className="flex justify-center items-center gap-4 mb-6 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your Email"
              className="px-4 py-2 w-full border border-gray-600 bg-black/50 text-white rounded-l-md focus:outline-none focus:border-purple-400"
            />
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-r-md hover:from-purple-700 hover:to-blue-700 transition">
              Subscribe
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6 text-gray-400 px-4 md:px-12 max-w-7xl mx-auto w-full">
          <div className="flex items-center space-x-2">
            <select className="border border-gray-600 bg-black/50 text-white rounded-md px-2 py-1 text-sm focus:outline-none">
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
            </select>
          </div>
          <div className="text-sm text-gray-400">© 2025 Fisiyo.</div>
          <div className="flex space-x-4">
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-purple-400 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.06 9.06 0 01-2.88 1.1A4.52 4.52 0 0016.67 0c-2.5 0-4.5 2.29-4.5 5.11 0 .4.05.8.14 1.18A12.94 12.94 0 013 1.64a4.93 4.93 0 00-.61 2.57c0 1.77.8 3.33 2 4.25a4.41 4.41 0 01-2.05-.58v.06c0 2.48 1.8 4.54 4.2 5a4.52 4.52 0 01-2.04.08c.57 1.88 2.22 3.25 4.18 3.29A9.06 9.06 0 012 19.54a12.8 12.8 0 006.92 2.06c8.3 0 12.84-7.1 12.84-13.25 0-.2 0-.42-.02-.63A9.22 9.22 0 0023 3z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="hover:text-purple-400 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.17c-3.34.73-4.04-1.61-4.04-1.61a3.18 3.18 0 00-1.34-1.76c-1.1-.75.08-.74.08-.74a2.5 2.5 0 011.83 1.24 2.54 2.54 0 003.47 1 2.54 2.54 0 01.76-1.6c-2.67-.3-5.47-1.33-5.47-5.93a4.64 4.64 0 011.24-3.22 4.3 4.3 0 01.12-3.18s1-.32 3.3 1.23a11.4 11.4 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23a4.3 4.3 0 01.12 3.18 4.64 4.64 0 011.24 3.22c0 4.61-2.8 5.62-5.48 5.92a2.85 2.85 0 01.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0012 0z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="hover:text-purple-400 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M20.45 20.45h-3.55v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85v5.5H9.5V9h3.41v1.56h.05a3.74 3.74 0 013.37-1.85c3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 11.01-4.14 2.07 2.07 0 01-.01 4.14zM7.12 20.45H3.56V9h3.56v11.45z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Telegram"
              className="hover:text-purple-400 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M22.46 3.01a1.5 1.5 0 00-2.11-.54L2.9 10.6a1.5 1.5 0 00.07 2.7l4.9 1.9 1.9 4.9a1.5 1.5 0 002.7.07l7.13-17.45a1.5 1.5 0 00-.14-1.7z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Email"
              className="hover:text-purple-400 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 2l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;