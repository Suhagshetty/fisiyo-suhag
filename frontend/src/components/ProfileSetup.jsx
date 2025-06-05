import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Shield, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileSetup = () => {
  const { user } = useAuth0();
  console.log(user);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: "",
    interests: [],
  });

  const navigate = useNavigate();

  const roles = ["Student/Enthu", "Professor", "Moderator"];
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
  };

  const handleInterestToggle = (interest) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: newInterests });
    console.log(formData.interests);
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = user.sub.replace(/^.*\|/, "");
    const payload = {
      userid: userId,
      name: formData.name,
      email: formData.email,
      role: mapRole(formData.role),
      interests: formData.interests,
    };

    try { 
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }
 
      const res = await fetch(`http://localhost:3000/api/users/${userId}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to fetch user after submission: ${res.status} - ${errorText}`
        );
      }

      const userData = await res.json();
      console.log("User profile saved and fetched:", userData);

      
      navigate("/feed", { state: { user: userData } });
    } catch (err) {
      console.error("Submission failed:", err.message); 
    }
  };

  const mapRole = (displayedRole) => {
    switch (displayedRole) {
      case "Student/Enthu":
        return "user";
      case "Professor":
        return "professor";
      case "Moderator":
        return "moderator";
      default:
        return "user";
    }
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

      {!formData.role ? (
        <div className="relative z-10 pt-15 pb-8">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1
              className="text-4xl lg:text-6xl font-light text-[#12261D] mb-6 tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}>
              Welcome to the{" "}
              <span className="text-[#49D470] font-normal">Elite</span>{" "}
              Scientific Community,{" "}
              {user.name && (
                <span
                  className="text-[#49D470]"
                  style={{ fontFamily: "Merriweather italic" }}>
                  {user.name}
                </span>
              )}
            </h1>
          </div>
        </div>
      ) : (
        " "
      )}


      {!formData.role ? ( 
        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
          <div className="backdrop-blur-sm rounded-3xl p-12 border border-white/50">
            <label
              className="block mb-4 text-xl font-medium text-gray-300 text-center"
              style={{ fontFamily: "Manrope, sans-serif" }}>
              Select your role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              {roles.map((role) => {
                const isSelected = formData.role === role;
                const icon =
                  role === "Student/Enthu" ? (
                    <Users className="w-8 h-8" />
                  ) : role === "Professor" ? (
                    <Sparkles className="w-8 h-8" />
                  ) : (
                    <Shield className="w-8 h-8" />
                  );

                return (
                  <div
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`group flex flex-col items-center justify-center p-26 rounded-xl border transition-all cursor-pointer
        ${
          isSelected
            ? "border-[#49D470] bg-[#49D470]/10"
            : "border-gray-300 bg-white"
        }
        hover:border-[#49D470]/60
        hover:text-[#49D470]
        hover:shadow-md`}>
                    <div
                      className={`mb-3 text-gray-600 transition-colors 
          ${isSelected ? "text-[#49D470]" : ""}
          group-hover:text-[#49D470]`}>
                      {icon}
                    </div>
                    <span className="text-lg font-medium text-center">
                      {role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : ( 
        <div className="relative z-10 max-w-4xl mx-auto pt-8 pb-24">
          <div className="space-y-12">
            <div className="backdrop-blur-sm flex justify-center items-center flex-wrap rounded-3xl">
              <div className="p-8 pb-8 mb-5 text-center">
                <h2
                  className="mb-4 text-center text-2xl sm:text-6xl font-light tracking-tight"
                  style={{ fontFamily: "Playfair Display, serif" }}>
                  Choose your{" "}
                  <span className="text-[#49D470] font-bold">interests</span>
                </h2>
              </div>

              <div
                className="interest-cloud relative scale-[0.85] md:scale-120"
                style={{
                  width: "600px",
                  height: "500px",
                  transformOrigin: "top center",
                }}>
                {scienceTopics.map((topic, index) => {
                  const isSelected = formData.interests.includes(topic);
                  const fonts = [
                    "Playfair Display",
                    "Roboto Condensed",
                    "Oswald",
                    "Lora",
                    "Merriweather",
                    "Raleway",
                    "Bebas Neue",
                    "Archivo Black",
                    "Space Mono",
                    "Pacifico",
                    "Rubik Moonrocks",
                    "Fjalla One",
                    "Abril Fatface",
                    "Righteous",
                    "Dancing Script",
                    "Press Start 2P",
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
                    12: { top: "61.5%", left: "28%", fontSize: "60px" }, // Robotics
                    13: { top: "49%", left: "48%", fontSize: "44px" }, // Space Exploration
                    14: { top: "57%", left: "12%", fontSize: "34px" }, // Immunology
                    15: { top: "21%", left: "8%", fontSize: "36px" }, // Data Science
                  };

                  return (
                    <span
                      key={topic}
                      onClick={() => handleInterestToggle(topic)}
                      className={`interest-word ${
                        isSelected ? "selected" : ""
                      }`}
                      style={{
                        position: "absolute",
                        whiteSpace: "nowrap",
                        ...positions[index],
                        color: isSelected ? "#49D470" : "#DFE6E9",
                        fontFamily: fonts[index],
                        fontWeight: [2, 5, 7, 11].includes(index) ? 900 : 400,
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

            {formData.interests.length >= 5 ? (
              <div className="text-center pt-8">
                <button
                  onClick={handleSubmit}
                  className={`group inline-flex items-center justify-center px-10 py-4 rounded-xl border transition-all duration-300
             ${
               formData.role
                 ? "border-[#49D470] bg-[#49D470]/10"
                 : "border-gray-300 bg-white"
             }
             hover:border-[#49D470]/60 hover:text-[#49D470] `}
                  style={{
                    fontFamily: "Playfair Display, serif",
                    color: "#12261D",
                  }}>
                  <span className="text-lg font-medium transition-colors group-hover:text-[#49D470]">
                    Complete Profile
                  </span>
                </button>
              </div>
            ) : (
              " "
            )}
          </div>
        </div>
      )}

      {/* Styles */}
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
        .interest-word {
          transition: all 0.3s ease;
          cursor: pointer;
          user-select: none;
        }
        .interest-word:hover {
          transform: scale(1.04);
          filter: brightness(1.05);
        }
        .interest-word.selected {
          color: #49d470 !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
};

export default ProfileSetup;
