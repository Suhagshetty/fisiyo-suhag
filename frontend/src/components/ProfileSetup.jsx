import React, { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Shield,
  Sparkles,
  Users,
  User,
  Calendar,
  UserCheck,
  Camera,
  X,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProfileSetup = () => {
  const { user, isLoading } = useAuth0();
  console.log(user);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    handle: "",
    gender: "",
    age: "",
    role: "",
    interests: [],
    profilePicture: null,
  });

  const [currentStep, setCurrentStep] = useState("role"); // role -> personal -> interests
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [handleAvailable, setHandleAvailable] = useState(null); // null: not checked, true: available, false: taken
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleDebounceTimer, setHandleDebounceTimer] = useState(null);
  const navigate = useNavigate();

  const roles = ["Student/Enthu", "Professor", "Explorer"];
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

  // Add this useEffect for handle checking
  useEffect(() => {
    return () => {
      if (handleDebounceTimer) {
        clearTimeout(handleDebounceTimer);
      }
    };
  }, [handleDebounceTimer]);

  // Add this function to check handle availability
  const checkHandleAvailability = async (handle) => {
    if (handle.length < 3) {
      setHandleAvailable(null);
      return;
    }

    setHandleChecking(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/users/check-handle?handle=${handle}`
      );
      setHandleAvailable(!response.data.exists);
    } catch (error) {
      console.error("Error checking handle:", error);
    } finally {
      setHandleChecking(false);
    }
  };

  // Update the handle input onChange handler
  const handleHandleChange = (e) => {
    const newHandle = e.target.value
      .replace(/[^a-zA-Z0-9_]/g, "")
      .toLowerCase();
    setFormData({ ...formData, handle: newHandle });

    // Clear previous timer
    if (handleDebounceTimer) {
      clearTimeout(handleDebounceTimer);
    }

    // Set new timer for debounce
    if (newHandle.length >= 3) {
      setHandleChecking(true);
      const timer = setTimeout(() => {
        checkHandleAvailability(newHandle);
      }, 500);
      setHandleDebounceTimer(timer);
    } else {
      setHandleAvailable(null);
      setHandleChecking(false);
    }
  };

  const handlePersonalInfoNext = () => {
    if (formData.name && formData.handle && formData.gender && formData.age) {
      setCurrentStep("interests");
    }
  };

  const handleInterestToggle = (interest) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: newInterests });
    console.log(formData.interests);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setFormData({ ...formData, profilePicture: file });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setProfilePicturePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = () => {
    setFormData({ ...formData, profilePicture: null });
    setProfilePicturePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const userId = user.sub.replace(/^.*\|/, "");

    try {
      let profilePictureUrl = null;

      // Upload profile picture if exists
      if (formData.profilePicture) {
        const imageFormData = new FormData();
        imageFormData.append("file", formData.profilePicture);

        const uploadResponse = await axios.post(
          `http://localhost:3000/upload`,
          imageFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const uploadedImageUrl = uploadResponse.data.downloadUrl;
        console.log("Uploaded profile picture URL:", uploadedImageUrl);

        // Extract filename from the URL for storing in MongoDB
        if (uploadedImageUrl && uploadedImageUrl.includes("uploads/")) {
          const filename = uploadedImageUrl.split("uploads/")[1];
          if (filename) {
            profilePictureUrl = filename;
          }
        }
      }

      const payload = {
        userid: userId,
        name: formData.name,
        email: formData.email,
        handle: formData.handle,
        gender: formData.gender,
        age: parseInt(formData.age),
        role:
          formData.role === "Explorer"
            ? "explorer"
            : formData.role.toLowerCase(),
        interests: formData.interests,
        profilePicture: profilePictureUrl, // Add profile picture URL
      };

      console.log("Payload being sent:", payload);

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
      alert("Failed to create profile. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRoleSelect = (role) => {
    if (isLoading || !user) return; // Wait for user to load
    setFormData({ ...formData, role });

    if (role === "Student/Enthu") {
      navigate("/student-setup", { state: { role } });
    } else if (role === "Professor") {
      navigate("/professor-setup", {
        state: {
          role,
          authUser: user, // Pass auth0 user object
        },
      });
    } else {
      // For Explorer, just move to next step
      setCurrentStep("personal");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AD49E1]/5 via-white to-[#AD49E1]/8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-64 h-64 bg-gradient-to-r from-[#AD49E1]/10 to-transparent rounded-full blur-3xl"
          style={{
            animation: "float 25s ease-in-out infinite",
            left: "20%",
            top: "10%",
          }}
        />
        <div
          className="absolute w-96 h-96 bg-gradient-to-l from-[#AD49E1]/8 to-transparent rounded-full blur-3xl"
          style={{
            animation: "float 30s ease-in-out infinite reverse",
            right: "15%",
            bottom: "20%",
          }}
        />
      </div>

      {/* Welcome Header */}
      {currentStep === "role" && (
        <div className="relative z-10 pt-15 pb-8">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1
              className="text-4xl lg:text-6xl font-light text-[#12261D] mb-6 tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}>
              Welcome to the{" "}
              <span className="text-[#AD49E1] font-normal">Elite</span>{" "}
              Scientific Community,{" "}
              {user.name && (
                <span
                  className="text-[#AD49E1]"
                  style={{ fontFamily: "Merriweather italic" }}>
                  {user.name}
                </span>
              )}
            </h1>
          </div>
        </div>
      )}

      {/* Role Selection Step */}
      {currentStep === "role" && (
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
            ? "border-[#AD49E1] bg-[#AD49E1]/10"
            : "border-gray-300 bg-white"
        }
        hover:border-[#AD49E1]/60
        hover:text-[#AD49E1]
        hover:shadow-md`}>
                    <div
                      className={`mb-3 text-gray-600 transition-colors 
          ${isSelected ? "text-[#AD49E1]" : ""}
          group-hover:text-[#AD49E1]`}>
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
      )}

      {/* Personal Information Step */}
      {currentStep === "personal" && (
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-24">
          <div className="backdrop-blur-sm rounded-3xl p-12 border border-white/50">
            <div className="text-center mb-8">
              <h2
                className="text-3xl lg:text-5xl font-light text-[#12261D] mb-4 tracking-tight"
                style={{ fontFamily: "Playfair Display, serif" }}>
                Tell us about{" "}
                <span className="text-[#AD49E1] font-normal">yourself</span>
              </h2>
              <p
                className="text-gray-600 text-lg"
                style={{ fontFamily: "Manrope, sans-serif" }}>
                Help us personalize your experience
              </p>
            </div>

            {/* Profile Picture Section */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <div className="relative w-32 h-32 rounded-full border-4 border-[#AD49E1]/20 overflow-hidden bg-gray-100">
                  {profilePicturePreview ? (
                    <>
                      <img
                        src={profilePicturePreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors">
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Camera size={32} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-[#AD49E1] text-white p-2 rounded-full hover:bg-[#AD49E1]/80 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-[#AD49E1]" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your full name"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                />
              </div>
              {/* Handle Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <UserCheck className="w-4 h-4 text-[#AD49E1]" />
                  Username Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={handleHandleChange}
                    className="w-full pl-8 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                    placeholder="your_handle"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {handleChecking && (
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    )}
                    {!handleChecking && handleAvailable === true && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {!handleChecking && handleAvailable === false && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  {!handleChecking && handleAvailable === false && (
                    <p className="absolute -bottom-6 left-0 text-red-500 text-sm">
                      This handle is already taken
                    </p>
                  )}
                </div>
              </div>

              {/* Gender Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 text-[#AD49E1]" />
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {genders.map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender })}
                      className={`px-4 py-2 rounded-lg border transition-all text-sm
                        ${
                          formData.gender === gender
                            ? "border-[#AD49E1] bg-[#AD49E1]/10 text-[#AD49E1]"
                            : "border-gray-200 bg-white/80 text-gray-600 hover:border-[#AD49E1]/50"
                        }`}
                      style={{ fontFamily: "Manrope, sans-serif" }}>
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
              {/* Age Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 text-[#AD49E1]" />
                  Age
                </label>
                <input
                  type="number"
                  min="13"
                  max="120"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your age"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                />
              </div>
            </div>

            {/* Continue Button */}
            <div className="text-center pt-8">
              <button
                onClick={handlePersonalInfoNext}
                disabled={
                  !formData.name ||
                  !formData.handle ||
                  formData.handle.length < 3 || // Require at least 3 characters
                  !formData.gender ||
                  !formData.age ||
                  handleAvailable === false || // Disable if handle is taken
                  handleChecking // Disable while checking
                }
                className={`group inline-flex items-center justify-center px-10 py-4 rounded-xl border transition-all duration-300
      ${
        formData.name &&
        formData.handle &&
        formData.handle.length >= 3 &&
        formData.gender &&
        formData.age &&
        handleAvailable !== false &&
        !handleChecking &&
        profilePicturePreview
          ? "border-[#AD49E1] bg-[#AD49E1]/10 hover:bg-[#AD49E1]/20 cursor-pointer"
          : "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
      }`}
                style={{
                  fontFamily: "Playfair Display, serif",
                  color: "#12261D",
                }}>
                <span
                  className={`text-lg font-medium transition-colors ${
                    formData.name &&
                    formData.handle &&
                    formData.handle.length >= 3 &&
                    formData.gender &&
                    formData.age &&
                    handleAvailable !== false &&
                    !handleChecking
                      ? "group-hover:text-[#AD49E1]"
                      : ""
                  }`}>
                  Continue to Interests
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interests Selection Step */}
      {currentStep === "interests" && (
        <div className="relative z-10 max-w-4xl mx-auto pt-8 pb-24">
          <div className="space-y-12">
            <div className="backdrop-blur-sm flex justify-center items-center flex-wrap rounded-3xl">
              <div className="p-8 pb-8 mb-5 text-center">
                <h2
                  className="mb-4 text-center text-2xl sm:text-6xl font-light tracking-tight"
                  style={{ fontFamily: "Playfair Display, serif" }}>
                  Choose your{" "}
                  <span className="text-[#AD49E1] font-bold">interests</span>
                </h2>
                <p
                  className="text-gray-600 text-lg mt-4"
                  style={{ fontFamily: "Manrope, sans-serif" }}>
                  Select at least 5 topics that interest you
                </p>
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
                        color: isSelected ? "#AD49E1" : "#DFE6E9",
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

            {/* Progress Indicator */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200">
                <span
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "Manrope, sans-serif" }}>
                  {formData.interests.length} of 5+ selected
                </span>
                <div className="flex gap-1">
                  {[...Array(Math.min(5, formData.interests.length))].map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#AD49E1]"
                      />
                    )
                  )}
                  {[...Array(Math.max(0, 5 - formData.interests.length))].map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gray-300"
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            {formData.interests.length >= 5 && (
              <div className="text-center pt-8">
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className={`group inline-flex items-center justify-center px-10 py-4 rounded-xl border transition-all duration-300 ${
                    isUploading
                      ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                      : "border-[#AD49E1] bg-[#AD49E1]/10 hover:bg-[#AD49E1]/20"
                  }`}
                  style={{
                    fontFamily: "Playfair Display, serif",
                    color: "#12261D",
                  }}>
                  <span
                    className={`text-lg font-medium transition-colors ${
                      !isUploading ? "group-hover:text-[#AD49E1]" : ""
                    }`}>
                    {isUploading ? "Creating Profile..." : "Complete Profile"}
                  </span>
                </button>
              </div>
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
          color: #ad49e1 !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
};

export default ProfileSetup;
