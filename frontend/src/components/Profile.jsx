import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Bookmark,
  Grid3X3,
  Clock,
  Settings,
  MessageCircle,
  Users,
  Award,
  ExternalLink,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth0();

  const mockPosts = [
    {
      title: "Novel Protein Folding Mechanism",
      type: "Research Paper",
      date: "2 days ago",
      engagement: "127 interactions",
    },
    {
      title: "Quantum Computing Applications",
      type: "Collaboration",
      date: "1 week ago",
      engagement: "89 interactions",
    },
    {
      title: "CRISPR Gene Editing Ethics",
      type: "Discussion",
      date: "2 weeks ago",
      engagement: "203 interactions",
    },
    {
      title: "Machine Learning in Drug Discovery",
      type: "Research Paper",
      date: "3 weeks ago",
      engagement: "156 interactions",
    },
    {
      title: "Climate Change Mitigation Strategies",
      type: "Collaboration",
      date: "1 month ago",
      engagement: "178 interactions",
    },
    {
      title: "Neuroscience Research Breakthrough",
      type: "Discussion",
      date: "1 month ago",
      engagement: "94 interactions",
    },
  ]; 
   
    return (
      <div className="min-h-screen bg-black">
        {/* Cover Section */}
        <section className="relative">
          <div
            className="w-full h-80 bg-cover bg-center relative overflow-hidden"
            style={{
              backgroundImage:
                "url('https://live.staticflickr.com/65535/52259221868_53dae692b6_h.jpg')",
            }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
        </section>

        {/* Profile Section */}
        {/* Profile Section */}
        {/* Profile Section */}
        <section className="relative max-w-6xl mx-auto px-6 lg:px-8">
          <div className="relative pt-24 flex items-start">
            {/* Profile Picture on left, half overlapping cover */}
            <div className="absolute left-6 -top-16 w-36 h-36 md:w-40 md:h-40 rounded-full border-4 border-black shadow-xl overflow-hidden bg-black">
              <img
                src={user?.picture || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#49D470] rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-black" strokeWidth={2} />
              </div>
            </div>

            {/* Profile Details - add left margin to avoid overlap with dp */}
            <div className="ml-48 bg-black rounded-3xl p-8 pt-8 flex-1">
              <div className="text-left space-y-6">
                <h1
                  className="text-4xl font-light text-[#49D470] tracking-tight"
                  style={{ fontFamily: "Playfair Display, serif" }}>
                  {user?.name || "Dr. Alexandra Chen"}
                </h1>

                <p
                  className="text-lg text-gray-400 font-light"
                  style={{ fontFamily: "Manrope, sans-serif" }}>
                  {user?.email || "alexandra.chen@university.edu"}
                </p>

                <p
                  className="text-gray-400 max-w-2xl leading-relaxed font-light"
                  style={{ fontFamily: "Manrope, sans-serif" }}>
                  Principal Investigator specializing in computational biology
                  and protein structure prediction. Collaborating with leading
                  researchers to advance precision medicine through AI-driven
                  discoveries.
                </p>

                <button className="flex items-center space-x-2 px-6 py-3 bg-[#49D470]/10 hover:bg-[#49D470]/20 rounded-full transition-colors border border-[#49D470]/20">
                  <Settings
                    className="w-4 h-4 text-[#49D470]"
                    strokeWidth={1.5}
                  />
                  <span
                    className="text-[#49D470] font-light"
                    style={{ fontFamily: "Manrope, sans-serif" }}>
                    Edit Profile
                  </span>
                </button>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-8 border-t border-gray-800/30">
                {[
                  { label: "Research Papers", value: "24", icon: ExternalLink },
                  { label: "Collaborations", value: "156", icon: Users },
                  { label: "Citations", value: "2,847", icon: Award },
                  { label: "Discussions", value: "89", icon: MessageCircle },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <stat.icon
                        className="w-5 h-5 text-[#49D470]"
                        strokeWidth={1.5}
                      />
                    </div>
                    <p
                      className="text-2xl font-light text-[#49D470] mb-1"
                      style={{ fontFamily: "Playfair Display, serif" }}>
                      {stat.value}
                    </p>
                    <p
                      className="text-gray-400 text-sm font-light"
                      style={{ fontFamily: "Manrope, sans-serif" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 px-6 lg:px-8 max-w-6xl mx-auto">
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-16">
            <div className="flex bg-black/60 backdrop-blur-sm rounded-full p-2 border border-gray-800/50">
              {[
                { label: "Recent Work", icon: Grid3X3, active: true },
                { label: "Activity", icon: Clock, active: false },
                { label: "Saved", icon: Bookmark, active: false },
              ].map((tab, index) => (
                <button
                  key={index}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${
                    tab.active
                      ? "bg-[#49D470] text-black shadow-lg"
                      : "text-gray-400 hover:text-[#49D470] hover:bg-[#49D470]/10"
                  }`}>
                  <tab.icon className="w-4 h-4" strokeWidth={1.5} />
                  <span
                    className="font-light"
                    style={{ fontFamily: "Manrope, sans-serif" }}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Research Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockPosts.map((post, index) => (
              <div
                key={index}
                className="group bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50 hover:border-[#49D470]/30 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <span
                    className="text-xs text-[#49D470] font-light tracking-widest uppercase"
                    style={{ fontFamily: "Manrope, sans-serif" }}>
                    {post.type}
                  </span>
                  <ExternalLink
                    className="w-4 h-4 text-gray-500 group-hover:text-[#49D470] transition-colors"
                    strokeWidth={1.5}
                  />
                </div>

                <h3
                  className="text-xl font-light text-gray-100 mb-4 leading-snug group-hover:text-[#49D470] transition-colors"
                  style={{ fontFamily: "Playfair Display, serif" }}>
                  {post.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span
                    className="font-light"
                    style={{ fontFamily: "Manrope, sans-serif" }}>
                    {post.date}
                  </span>
                  <span
                    className="font-light"
                    style={{ fontFamily: "Manrope, sans-serif" }}>
                    {post.engagement}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-16">
            <button
              className="text-gray-400 hover:text-[#49D470] font-light transition-colors text-lg tracking-wide border-b border-transparent hover:border-[#49D470] pb-1"
              style={{ fontFamily: "Manrope, sans-serif" }}>
              View More Research
            </button>
          </div>
        </section>
      </div>
    );
  };

export default Profile;
