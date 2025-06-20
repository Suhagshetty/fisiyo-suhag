import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  User,
  UserCheck,
  Calendar,
  Camera,
  X,
  Book,
  School,
  BookOpen,
  Bookmark,
  Users,
  Mail,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import axios from "axios";

const StudentSetup = () => {
  const location = useLocation();
  const { formData: initialFormData, authUser } = location.state || {};
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);

  const currentUser = authUser || user;

  const [currentStep, setCurrentStep] = useState("academic");
  const [formData, setFormData] = useState({
    ...initialFormData,
    educationLevel: "",
    institutionName: "",
    institutionRegNumber: "",
    currentGradeYear: "",
    name: currentUser?.name || "",
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
  const educationLevels = ["School", "College"];
  const schoolGrades = ["8th", "9th", "10th", "11th", "12th"];
  const collegeYears = [
    "1st year",
    "2nd year",
    "3rd year",
    "4th year",
    "5th year",
  ];

  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [handleAvailable, setHandleAvailable] = useState(null);
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleDebounceTimer, setHandleDebounceTimer] = useState(null);

  // College search implementation
  useEffect(() => {
    const fetchColleges = async () => {
      if (
        formData.educationLevel === "College" &&
        formData.institutionName.length >= 2
      ) {
        setIsLoadingColleges(true);
        try {
          const response = await axios.get(
            `http://localhost:3000/api/colleges?search=${formData.institutionName}`
          );
          setCollegeOptions(response.data);
        } catch (error) {
          console.error("Error fetching colleges:", error);
        }
        setIsLoadingColleges(false);
      } else {
        setCollegeOptions([]);
      }
    };

    const debounceTimer = setTimeout(fetchColleges, 300);
    return () => clearTimeout(debounceTimer);
  }, [formData.institutionName, formData.educationLevel]);

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
      formData.educationLevel &&
      formData.institutionName &&
      formData.institutionRegNumber &&
      formData.currentGradeYear
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

      if (formData.profilePicture) {
        const imageFormData = new FormData();
        imageFormData.append("file", formData.profilePicture);

        const uploadResponse = await axios.post(
          `http://localhost:3000/upload`,
          imageFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const uploadedImageUrl = uploadResponse.data.downloadUrl;
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
        email: currentUser.email,
        handle: formData.handle,
        gender: formData.gender,
        age: parseInt(formData.age),
        role: "student",
        interests: formData.interests,
        profilePicture: profilePictureUrl,
        educationLevel: formData.educationLevel,
        institutionName: formData.institutionName,
        institutionRegNumber: formData.institutionRegNumber,
        currentGradeYear: formData.currentGradeYear,
      };

      const response = await fetch("http://localhost:3000/api/students", {
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

      const res = await fetch(`http://localhost:3000/api/students/${userId}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to fetch user after submission: ${res.status} - ${errorText}`
        );
      }

      const userData = await res.json();
      navigate("/feed", { state: { user: userData } });
    } catch (err) {
      console.error("Submission failed:", err.message);
      alert("Failed to create profile. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#49B8E1]/5 via-white to-[#49B8E1]/8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-64 h-64 bg-gradient-to-r from-[#49B8E1]/10 to-transparent rounded-full blur-3xl"
          style={{
            animation: "float 25s ease-in-out infinite",
            left: "20%",
            top: "10%",
          }}
        />
        <div
          className="absolute w-96 h-96 bg-gradient-to-l from-[#49B8E1]/8 to-transparent rounded-full blur-3xl"
          style={{
            animation: "float 30s ease-in-out infinite reverse",
            right: "15%",
            bottom: "20%",
          }}
        />
      </div>

      {/* Student Setup Header */}
      <div className="relative z-10 pt-15 pb-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1
            className="text-4xl lg:text-6xl font-light text-[#12261D] mb-6 tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}>
            Student <span className="text-[#49B8E1] font-normal">Profile</span>{" "}
            Setup
          </h1>

          {currentStep === "academic" && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Please provide your academic information to complete your student
              profile
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
                  ? "bg-[#49B8E1] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}>
              1
            </div>
            <div
              className={`h-1 w-16 ${
                currentStep === "academic" ? "bg-gray-300" : "bg-[#49B8E1]"
              }`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === "personal"
                  ? "bg-[#49B8E1] text-white"
                  : currentStep === "interests"
                  ? "bg-[#49B8E1] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}>
              2
            </div>
            <div
              className={`h-1 w-16 ${
                currentStep === "interests" ? "bg-[#49B8E1]" : "bg-gray-300"
              }`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === "interests"
                  ? "bg-[#49B8E1] text-white"
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
              {/* Education Level */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <School className="w-4 h-4 text-[#49B8E1]" />
                  Education Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {educationLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          educationLevel: level,
                          currentGradeYear: "", // Reset grade/year when level changes
                        });
                        setCollegeOptions([]);
                      }}
                      className={`px-4 py-2 rounded-lg border transition-all text-sm
                        ${
                          formData.educationLevel === level
                            ? "border-[#49B8E1] bg-[#49B8E1]/10 text-[#49B8E1]"
                            : "border-gray-200 bg-white/80 text-gray-600 hover:border-[#49B8E1]/50"
                        }`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Institution Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Book className="w-4 h-4 text-[#49B8E1]" />
                  Institution Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        institutionName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                    placeholder={
                      formData.educationLevel === "College"
                        ? "Search your college or university"
                        : "Enter your school name"
                    }
                  />

                  {isLoadingColleges &&
                    formData.educationLevel === "College" && (
                      <div className="absolute right-3 top-3.5">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}

                  {collegeOptions.length > 0 &&
                    !isLoadingColleges &&
                    formData.educationLevel === "College" && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {collegeOptions.map((college, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                institutionName: college,
                              });
                              setCollegeOptions([]);
                            }}>
                            {college}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Registration Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Bookmark className="w-4 h-4 text-[#49B8E1]" />
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.institutionRegNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institutionRegNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="Your institution registration ID"
                />
              </div>

              {/* Current Grade/Year */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BookOpen className="w-4 h-4 text-[#49B8E1]" />
                  Current{" "}
                  {formData.educationLevel === "College" ? "Year" : "Grade"}
                </label>
                <select
                  value={formData.currentGradeYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentGradeYear: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm appearance-none">
                  <option value="">
                    Select your{" "}
                    {formData.educationLevel === "College" ? "year" : "grade"}
                  </option>
                  {(formData.educationLevel === "College"
                    ? collegeYears
                    : schoolGrades
                  ).map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
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
                  <div className="relative w-32 h-32 rounded-full border-4 border-[#49B8E1]/20 overflow-hidden bg-gray-100">
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
                    className="absolute bottom-0 right-0 bg-[#49B8E1] text-white p-2 rounded-full hover:bg-[#49B8E1]/80 transition-colors">
                    <Camera size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 text-[#49B8E1]" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                {/* Handle Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <UserCheck className="w-4 h-4 text-[#49B8E1]" />
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
                      className="w-full pl-8 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm"
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
                    <Users className="w-4 h-4 text-[#49B8E1]" />
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
                              ? "border-[#49B8E1] bg-[#49B8E1]/10 text-[#49B8E1]"
                              : "border-gray-200 bg-white/80 text-gray-600 hover:border-[#49B8E1]/50"
                          }`}>
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Age Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 text-[#49B8E1]" />
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm"
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
                      0: { top: "26%", left: "40%", fontSize: "58px" },
                      1: { top: "10%", left: "4%", fontSize: "44px" },
                      2: { top: "-4%", left: "27%", fontSize: "64px" },
                      3: { top: "11%", left: "50%", fontSize: "40px" },
                      4: { top: "38.5%", left: "56%", fontSize: "48px" },
                      5: { top: "20%", left: "44%", fontSize: "44px" },
                      6: { top: "22.5%", left: "76%", fontSize: "27px" },
                      7: { top: "38%", left: "0%", fontSize: "44px" },
                      8: { top: "30%", left: "3%", fontSize: "32px" },
                      9: { top: "49%", left: "5%", fontSize: "32px" },
                      10: { top: "2%", left: "-8%", fontSize: "32px" },
                      11: { top: "59%", left: "44%", fontSize: "34px" },
                      12: { top: "61.5%", left: "28%", fontSize: "60px" },
                      13: { top: "49%", left: "48%", fontSize: "44px" },
                      14: { top: "57%", left: "12%", fontSize: "34px" },
                      15: { top: "21%", left: "8%", fontSize: "36px" },
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
                          color: isSelected ? "#49B8E1" : "#DFE6E9",
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
                          className="w-2 h-2 rounded-full bg-[#49B8E1]"
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
                  !formData.educationLevel ||
                  !formData.institutionName ||
                  !formData.institutionRegNumber ||
                  !formData.currentGradeYear
                }
                className={`group inline-flex items-center justify-center px-10 py-4 rounded-xl border transition-all duration-300
                  ${
                    formData.educationLevel &&
                    formData.institutionName &&
                    formData.institutionRegNumber &&
                    formData.currentGradeYear
                      ? "border-[#49B8E1] bg-[#49B8E1]/10 hover:bg-[#49B8E1]/20 cursor-pointer"
                      : "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                  }`}
                style={{
                  fontFamily: "Playfair Display, serif",
                  color: "#12261D",
                }}>
                <span
                  className={`text-lg font-medium transition-colors ${
                    formData.educationLevel &&
                    formData.institutionName &&
                    formData.institutionRegNumber &&
                    formData.currentGradeYear
                      ? "group-hover:text-[#49B8E1]"
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
                      ? "border-[#49B8E1] bg-[#49B8E1]/10 hover:bg-[#49B8E1]/20 cursor-pointer"
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
                      ? "group-hover:text-[#49B8E1]"
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
                    : "border-[#49B8E1] bg-[#49B8E1]/10 hover:bg-[#49B8E1]/20"
                }`}
                style={{
                  fontFamily: "Playfair Display, serif",
                  color: "#12261D",
                }}>
                <span
                  className={`text-lg font-medium transition-colors ${
                    !isUploading ? "group-hover:text-[#49B8E1]" : ""
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
          color: #49b8e1 !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
};

export default StudentSetup;
