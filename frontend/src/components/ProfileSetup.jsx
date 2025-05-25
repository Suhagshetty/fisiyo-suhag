import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ChevronDown, Sparkles, Users } from "lucide-react";
// ... (imports remain the same)

const ProfileSetup = () => {
  const { user } = useAuth0();
  console.log(user);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: "",
    gender: "",
    interests: [],
  });

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const roles = ["user", "professor", "moderator"];
  const genders = ["male", "female", "other", "prefer not to say"];

  const scienceTopics = [
    "Quantum Physics",
    "Biotechnology",
    "Artificial Intelligence",
    "Climate Science",
    "Neuroscience",
    "Genomics",
    "Astrophysics",
    "Materials Science",
    "Nanotechnology",
    "Renewable Energy",
    "Marine Biology",
    "Biochemistry",
    "Robotics",
    "Space Exploration",
    "Immunology",
    "Data Science",
  ];

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setIsRoleOpen(false);
  };

  const handleGenderSelect = (gender) => {
    setFormData({ ...formData, gender });
    setIsGenderOpen(false);
  };

  const handleInterestToggle = (interest) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];

    setFormData({ ...formData, interests: newInterests });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Complete profile data:", formData);
    // Add your submit logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#49D470]/5 via-white to-[#49D470]/8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-64 h-64 bg-gradient-to-r from-[#49D470]/10 to-transparent rounded-full blur-3xl"
          style={{
            animation: "float 25s ease-in-out infinite",
            left: "20%",
            top: "10%",
          }}
        />
        <div
          className="absolute w-96 h-96 bg-gradient-to-l from-[#49D470]/8 to-transparent rounded-full blur-3xl"
          style={{
            animation: "float 30s ease-in-out infinite reverse",
            right: "15%",
            bottom: "20%",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
        }
        .interest-item {
          transition: all 0.3s ease;
          cursor: pointer;
          user-select: none;
          background: none;
          border: none;
          padding: 0;
        }
        .interest-item:hover {
          transform: scale(1.04);
          filter: brightness(1.05);
        }
        .interest-item.selected span {
          color: #49d470;
          font-weight: 700;
        }
        @keyframes fadeSlide {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .typographic-title {
          animation: fadeSlide 1.2s ease-out forwards;
        }
      `}</style>

      <div className="relative z-10 pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
            <Sparkles className="w-5 h-5 text-[#49D470]" strokeWidth={1.5} />
            <span
              className="text-[#49D470] text-sm font-light tracking-widest uppercase"
              style={{ fontFamily: "Manrope, sans-serif" }}>
              Complete Your Profile
            </span>
          </div> */}

          <h1
            className="text-4xl lg:text-6xl font-light text-[#12261D] mb-6 tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}>
            Welcome to the{" "}
            <span className="text-[#49D470] font-normal">Elite</span> Scientific
            Community,{" "}
            {user.name && (
              <span
                className="text-[#49D470] "
                style={{ fontFamily: "Merriweather italic" }}>
                {user.name}
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="space-y-12">
          <div className=" backdrop-blur-sm rounded-3xl p-12 border border-white/50 ">
            <div className="grid md:grid-cols-2 gap-8">
              {/* <div>
                <input
                  type="text"
                  disabled
                  value={formData.name}
                  className="w-full px-6 py-4 rounded-xl border border-gray-200 bg-gray-50 text-slate-800 cursor-not-allowed transition-all"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                />
              </div> */}

              {/* Role Dropdown */}
              <div className="relative">
                <div
                  className="w-full px-6 py-4 rounded-xl border border-gray-300 bg-white text-slate-800 cursor-pointer transition-all hover:border-[#49D470]/50 hover:shadow-lg"
                  onClick={() => setIsRoleOpen(!isRoleOpen)}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontFamily: "Manrope, sans-serif" }}>
                      {formData.role || "Select your role"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isRoleOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
                {isRoleOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden">
                    {roles.map((role) => (
                      <div
                        key={role}
                        className="px-6 py-4 hover:bg-[#49D470]/5 cursor-pointer transition-colors capitalize"
                        onClick={() => handleRoleSelect(role)}
                        style={{ fontFamily: "Manrope, sans-serif" }}>
                        {role}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gender Dropdown */}
              <div className="relative">
                <div
                  className="w-full px-6 py-4 rounded-xl border border-gray-300 bg-white text-slate-800 cursor-pointer transition-all hover:border-[#49D470]/50 hover:shadow-lg"
                  onClick={() => setIsGenderOpen(!isGenderOpen)}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontFamily: "Manrope, sans-serif" }}>
                      {formData.gender || "Select gender"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isGenderOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
                {isGenderOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden">
                    {genders.map((gender) => (
                      <div
                        key={gender}
                        className="px-6 py-4 hover:bg-[#49D470]/5 cursor-pointer transition-colors capitalize"
                        onClick={() => handleGenderSelect(gender)}
                        style={{ fontFamily: "Manrope, sans-serif" }}>
                        {gender}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interests Section */}
          <div className=" backdrop-blur-sm flex justify-center item-center flex-wrap rounded-3xl  ">
            <div className="p-8 pb-8 mb-5 text-center">
              <h2
                className=" mb-4 text-center text-2xl sm:text-2xl md:text-5xl font-light tracking-tight"
                style={{ fontFamily: "Playfair Display, serif" }}>
                <span className="text-[#12261D]">Choose your </span>
                <span className="text-[#49D470] font-semibold text-2xl sm:text-6xl">
                  scientific
                </span>
                <span className="text-[#12261D]"> </span>
                <span className="text-[#49D470] font-bold text-3xl sm:text-7xl">
                  interests
                </span>
              </h2>
            </div>

            <div
              className="interest-cloud relative   interest-cloud relative scale-[0.55] sm:scale-[0.85] md:scale-130"
              style={{
                width: "600px",
                height: "500px",
                transformOrigin: "top center",
              }}>
              {scienceTopics.map((topic, index) => {
                const isSelected = formData.interests.includes(topic);

                // Add font array corresponding to positions
                const fonts = [
                  "Playfair Display", // 0
                  "Roboto Condensed", // 1
                  "Oswald", // 2
                  "Lora", // 3
                  "Merriweather", // 4
                  "Raleway", // 5
                  "Bebas Neue", // 6
                  "Archivo Black", // 7
                  "Space Mono", // 8
                  "Pacifico", // 9
                  "Rubik Moonrocks", // 10
                  "Fjalla One", // 11
                  "Abril Fatface", // 12
                  "Righteous", // 13
                  "Dancing Script", // 14
                  "Press Start 2P", // 15
                ];

                const positions = {
                  0: { top: "26%", left: "40%", fontSize: "58px" }, // Quantum Physics
                  1: { top: "10%", left: "4%", fontSize: "44px" }, // Biotechnology
                  2: { top: "-4%", left: "27%", fontSize: "64px" }, // Artificial Intelligence
                  3: { top: "11%", left: "50%", fontSize: "40px" }, // Climate Science
                  4: { top: "38.5%", left: "56%", fontSize: "48px" }, // Neuroscience
                  5: { top: "20%", left: "44%", fontSize: "44px" }, // Genomics
                  6: { top: "22.5%", left: "76%", fontSize: "27px" }, // Astrophysics
                  7: { top: "38%", left: "0%", fontSize: "44px" }, // Materials Science
                  8: { top: "30%", left: "3%", fontSize: "32px" }, // Nanotechnology
                  9: { top: "49%", left: "5%", fontSize: "32px" }, // Renewable Energy
                  10: { top: "2%", left: "-8%", fontSize: "32px" }, // Marine Biology
                  11: { top: "59%", left: "44%", fontSize: "34px" }, // Biochemistry
                  12: { top: "63%", left: "30%", fontSize: "60px" }, // Robotics
                  13: { top: "49%", left: "48%", fontSize: "44px" }, // Space Exploration
                  14: { top: "57%", left: "12%", fontSize: "34px" }, // Immunology
                  15: { top: "21%", left: "8%", fontSize: "36px" }, // Data Science
                };

                return (
                  <span
                    key={topic}
                    onClick={() => handleInterestToggle(topic)}
                    className={`interest-word ${isSelected ? "selected" : ""}`}
                    style={{
                      position: "absolute",
                      whiteSpace: "nowrap",
                      ...positions[index],
                      color: isSelected ? "#49D470" : "#DFE6E9",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      fontFamily: fonts[index], // Use different font for each index
                      fontWeight: [2, 5, 7, 11].includes(index) ? 900 : 400, // Vary weights
                      fontStyle: [3, 9, 14].includes(index)
                        ? "italic"
                        : "normal",
                    }}>
                    {topic}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-8">
            <button
              type="submit"
              onClick={handleSubmit}
              className="inline-flex items-center px-10 py-4 rounded-xl bg-[#49D470] text-white text-lg font-semibold hover:bg-[#2EB171] transition-colors">
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
