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
  const { formData: initialFormData, role } = location.state || {};
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);

  // Initialize form data with personal details from previous page
  const [formData, setFormData] = useState({
    ...initialFormData,
    institutionName: "",
    department: "",
    professorId: "",
    institutionEmail: "",
    yearsOfExperience: "",
    designation: "",
    institutionAddress: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState(null);
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleDebounceTimer, setHandleDebounceTimer] = useState(null);

  useEffect(() => {
    const fetchColleges = async () => {
      if (formData.institutionName.length >= 2) {
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
  }, [formData.institutionName]);

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
        email: user.email,
        handle: formData.handle,
        gender: formData.gender,
        age: parseInt(formData.age),
        occupation: formData.occupation,
        role: role.toLowerCase(),
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

      {/* Professor Setup Header */}
      <div className="relative z-10 pt-15 pb-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1
            className="text-4xl lg:text-6xl font-light text-[#12261D] mb-6 tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}>
            Professor{" "}
            <span className="text-[#49B8E1] font-normal">Profile</span> Setup
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please provide your academic information to complete your professor
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

            {/* Institution Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building className="w-4 h-4 text-[#49B8E1]" />
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
                  placeholder="Search your university or institution"
                />

                {isLoadingColleges && (
                  <div className="absolute right-3 top-3.5">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}

                {collegeOptions.length > 0 && !isLoadingColleges && (
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

            {/* Department */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <GraduationCap className="w-4 h-4 text-[#49B8E1]" />
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                placeholder="Your department"
              />
            </div>

            {/* Professor ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Briefcase className="w-4 h-4 text-[#49B8E1]" />
                Professor ID
              </label>
              <input
                type="text"
                value={formData.professorId}
                onChange={(e) =>
                  setFormData({ ...formData, professorId: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                placeholder="Your institution ID"
              />
            </div>

            {/* Institution Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4 text-[#49B8E1]" />
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                placeholder="your.email@institution.edu"
              />
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 text-[#49B8E1]" />
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                placeholder="Number of years"
              />
            </div>

            {/* Designation */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4 text-[#49B8E1]" />
                Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                placeholder="Your position/title"
              />
            </div>

            {/* Institution Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 text-[#49B8E1]" />
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#49B8E1] focus:ring-2 focus:ring-[#49B8E1]/20 transition-all bg-white/80 backdrop-blur-sm"
                placeholder="Institution's full address"
              />
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
                !formData.institutionName ||
                !formData.department ||
                !formData.professorId ||
                !formData.institutionEmail ||
                !formData.yearsOfExperience
              }
              className={`group inline-flex items-center justify-center px-10 py-4 rounded-xl border transition-all duration-300
                ${
                  !isUploading &&
                  formData.handle &&
                  formData.handle.length >= 3 &&
                  handleAvailable !== false &&
                  !handleChecking &&
                  formData.institutionName &&
                  formData.department &&
                  formData.professorId &&
                  formData.institutionEmail &&
                  formData.yearsOfExperience
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

export default ProfessorSetup;
