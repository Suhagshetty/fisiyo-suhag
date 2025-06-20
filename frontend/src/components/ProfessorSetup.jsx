import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth0 } from "@auth0/auth0-react";
import {
  User,
  UserCheck,
  Calendar,
  Camera,
  X,
  Building,
  GraduationCap,
  Briefcase,
  Users,
  Mail,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import axios from "axios";

const ProfessorSetup = () => {
  
  const location = useLocation();
  const { formData: initialFormData, authUser } = location.state || {}; // Get authUser from state
  const navigate = useNavigate();
  const { user } = useAuth0();

  // Use authUser if available, otherwise use Auth0 user
  const currentUser = authUser || user;
  console.log("user", user);
  

  const [currentStep, setCurrentStep] = useState("academic"); // academic -> personal -> interests
  const [formData, setFormData] = useState({
    ...initialFormData,
    institutionName: "",
    department: "",
    professorId: "",
    institutionEmail: "",
    yearsOfExperience: "",
    designation: "",
    institutionAddress: "",
    name: currentUser?.name || "", // Use currentUser
    handle: "",
    gender: "",
    age: "",
    interests: [],
    profilePicture: null,
  });


  

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

  const genders = ["male", "female", "other", "prefer not to say"];
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [handleAvailable, setHandleAvailable] = useState(null);
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleDebounceTimer, setHandleDebounceTimer] = useState(null);

  useEffect(() => {
    return () => {
      if (handleDebounceTimer) clearTimeout(handleDebounceTimer);
    };
  }, [handleDebounceTimer]);

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

  const handleHandleChange = (e) => {
    const newHandle = e.target.value
      .replace(/[^a-zA-Z0-9_]/g, "")
      .toLowerCase();
    setFormData({ ...formData, handle: newHandle });

    if (handleDebounceTimer) clearTimeout(handleDebounceTimer);

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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setFormData({ ...formData, profilePicture: file });

    const reader = new FileReader();
    reader.onloadend = () => setProfilePicturePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = () => {
    setFormData({ ...formData, profilePicture: null });
    setProfilePicturePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAcademicNext = () => {
    if (
      formData.institutionName &&
      formData.department &&
      formData.professorId &&
      formData.institutionEmail &&
      formData.yearsOfExperience
    ) {
      setCurrentStep("personal");
    }
  };

  const handlePersonalNext = () => {
    if (
      formData.name &&
      formData.handle &&
      formData.gender &&
      formData.age &&
      profilePicturePreview
    ) {
      setCurrentStep("interests");
    }
  };

  const handleInterestToggle = (interest) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: newInterests });
  };

  const handleSubmit = async () => {
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
        email: currentUser.email, // Use currentUser.email directly
        handle: formData.handle,
        gender: formData.gender,
        age: parseInt(formData.age),
        role: "professor",
        interests: formData.interests,
        profilePicture: profilePictureUrl,
        institution: {
          name: formData.institutionName,
          department: formData.department,
          id: formData.professorId,
          email: formData.institutionEmail,
          yearsOfExperience: formData.yearsOfExperience,
          designation: formData.designation,
          address: formData.institutionAddress,
        },
      };
      
      console.log("Payload being sent:", payload);

      const response = await fetch("http://localhost:3000/api/professors", {
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

      const res = await fetch(`http://localhost:3000/api/professors/${userId}`);
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

      {/* Professor Setup Header */}
      <div className="relative z-10 pt-15 pb-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1
            className="text-4xl lg:text-6xl font-light text-[#12261D] mb-6 tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}>
            Professor{" "}
            <span className="text-[#AD49E1] font-normal">Profile</span> Setup
          </h1>

          {currentStep === "academic" && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Please provide your academic information to complete your
              professor profile
            </p>
          )}
          {currentStep === "personal" && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Add your personal information
            </p>
          )}
          {currentStep === "interests" && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select your scientific interests
            </p>
          )}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="relative z-10 max-w-md mx-auto mb-8">
        <div className="flex justify-center">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === "academic"
                  ? "bg-[#AD49E1] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}>
              1
            </div>
            <div
              className={`h-1 w-16 ${
                currentStep === "academic" ? "bg-gray-300" : "bg-[#AD49E1]"
              }`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === "personal"
                  ? "bg-[#AD49E1] text-white"
                  : currentStep === "interests"
                  ? "bg-[#AD49E1] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}>
              2
            </div>
            <div
              className={`h-1 w-16 ${
                currentStep === "interests" ? "bg-[#AD49E1]" : "bg-gray-300"
              }`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === "interests"
                  ? "bg-[#AD49E1] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}>
              3
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Academic</span>
          <span>Personal</span>
          <span>Interests</span>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-24">
        <div className="backdrop-blur-sm rounded-3xl p-12 border border-white/50">
          {/* Academic Step */}
          {currentStep === "academic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Institution Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building className="w-4 h-4 text-[#AD49E1]" />
                  Institution Name
                </label>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institutionName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="Your university or institution"
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <GraduationCap className="w-4 h-4 text-[#AD49E1]" />
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="Your department"
                />
              </div>

              {/* Professor ID */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Briefcase className="w-4 h-4 text-[#AD49E1]" />
                  Professor ID
                </label>
                <input
                  type="text"
                  value={formData.professorId}
                  onChange={(e) =>
                    setFormData({ ...formData, professorId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="Your institution ID"
                />
              </div>

              {/* Institution Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4 text-[#AD49E1]" />
                  Institution Email
                </label>
                <input
                  type="email"
                  value={formData.institutionEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institutionEmail: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="your.email@institution.edu"
                />
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 text-[#AD49E1]" />
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearsOfExperience: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="Number of years"
                />
              </div>

              {/* Designation */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-[#AD49E1]" />
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="Your position/title"
                />
              </div>

              {/* Institution Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 text-[#AD49E1]" />
                  Institution Address
                </label>
                <input
                  type="text"
                  value={formData.institutionAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institutionAddress: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="Institution's full address"
                />
              </div>
            </div>
          )}

          {/* Personal Information Step */}
          {currentStep === "personal" && (
            <div>
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
                          }`}>
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
                  />
                </div>
              </div>
            </div>
          )}

          {/* Interests Selection Step */}
          {currentStep === "interests" && (
            <div className="space-y-12">
              <div className="backdrop-blur-sm flex justify-center items-center flex-wrap rounded-3xl">
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
                  <span className="text-sm text-gray-600">
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
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="text-center pt-12">
            {currentStep === "academic" && (
              <button
                onClick={handleAcademicNext}
                disabled={
                  !formData.institutionName ||
                  !formData.department ||
                  !formData.professorId ||
                  !formData.institutionEmail ||
                  !formData.yearsOfExperience
                }
                className={`group inline-flex items-center justify-center px-10 py-4 rounded-xl border transition-all duration-300
                  ${
                    formData.institutionName &&
                    formData.department &&
                    formData.professorId &&
                    formData.institutionEmail &&
                    formData.yearsOfExperience
                      ? "border-[#AD49E1] bg-[#AD49E1]/10 hover:bg-[#AD49E1]/20 cursor-pointer"
                      : "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                  }`}
                style={{
                  fontFamily: "Playfair Display, serif",
                  color: "#12261D",
                }}>
                <span
                  className={`text-lg font-medium transition-colors ${
                    formData.institutionName &&
                    formData.department &&
                    formData.professorId &&
                    formData.institutionEmail &&
                    formData.yearsOfExperience
                      ? "group-hover:text-[#AD49E1]"
                      : ""
                  }`}>
                  Continue to Personal Info
                </span>
              </button>
            )}

            {currentStep === "personal" && (
              <button
                onClick={handlePersonalNext}
                disabled={
                  !formData.name ||
                  !formData.handle ||
                  formData.handle.length < 3 ||
                  !formData.gender ||
                  !formData.age ||
                  handleAvailable === false ||
                  handleChecking ||
                  !profilePicturePreview
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
            )}

            {currentStep === "interests" && formData.interests.length >= 5 && (
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
            )}
          </div>
        </div>
      </div>

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

export default ProfessorSetup;
