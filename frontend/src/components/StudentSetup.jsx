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
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";

const StudentSetup = () => {
  const location = useLocation();
  const { formData: initialFormData } = location.state || {};
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);

  // Initialize form data with personal details from previous page
  const [formData, setFormData] = useState({
    ...initialFormData,
    educationLevel: "",
    institutionName: "",
    institutionRegNumber: "",
    currentGradeYear: "",
    handle: "",
  });

  const educationLevels = ["School", "College"];
  const schoolGrades = ["8th", "9th", "10th", "11th", "12th"];
  const collegeYears = [
    "1st year",
    "2nd year",
    "3rd year",
    "4th year",
    "5th year",
  ];

  const [isUploading, setIsUploading] = useState(false);
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
        if (uploadedImageUrl && uploadedImageUrl.includes("uploads/")) {
          const filename = uploadedImageUrl.split("uploads/")[1];
          if (filename) profilePictureUrl = filename;
        }
      }

      const payload = {
        userid: userId,
        name: formData.name,
        email: user.email,
        handle: formData.handle,
        gender: formData.gender,
        age: parseInt(formData.age),
        occupation: formData.occupation,
        role: "student",
        interests: formData.interests,
        profilePicture: profilePictureUrl,
        educationLevel: formData.educationLevel,
        institutionName: formData.institutionName,
        institutionRegNumber: formData.institutionRegNumber,
        currentGradeYear: formData.currentGradeYear,
      };

      console.log("payload" ,payload);
      
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

      const userData = await response.json();
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
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please provide your academic information to complete your student
            profile
          </p>
        </div>
      </div>

      {/* User Summary */}
      <div className="relative z-10 max-w-md mx-auto mb-8 flex justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-4 border border-gray-200">
          {formData.profilePicturePreview ? (
            <img
              src={formData.profilePicturePreview}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-[#12261D]">
              {formData.name}
            </h3>
            <p className="text-gray-600">
              {formData.interests.slice(0, 3).join(", ")}
              {formData.interests.length > 3 ? "..." : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="backdrop-blur-sm rounded-3xl p-12 border border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                {isLoadingColleges && formData.educationLevel === "College" && (
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

          {/* Submit Button */}
          <div className="text-center pt-12">
            <button
              onClick={handleSubmit}
              disabled={
                isUploading ||
                !formData.handle ||
                formData.handle.length < 3 ||
                handleAvailable === false ||
                handleChecking ||
                !formData.educationLevel ||
                !formData.institutionName ||
                !formData.institutionRegNumber ||
                !formData.currentGradeYear
              }
              className={`group inline-flex items-center justify-center px-10 py-4 rounded-xl border transition-all duration-300
                ${
                  !isUploading &&
                  formData.handle &&
                  formData.handle.length >= 3 &&
                  handleAvailable !== false &&
                  !handleChecking &&
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
                  !isUploading ? "group-hover:text-[#49B8E1]" : ""
                }`}>
                {isUploading ? "Creating Profile..." : "Complete Profile"}
              </span>
            </button>
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
      `}</style>
    </div>
  );
};

export default StudentSetup;
