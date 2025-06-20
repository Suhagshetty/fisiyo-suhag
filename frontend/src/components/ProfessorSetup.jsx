import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  UserCheck,
  Calendar,
  Camera,
  X,
  Building,
  GraduationCap,
  Briefcase,
  Mail,
  MapPin,
} from "lucide-react";
import axios from "axios";

const ProfessorSetup = () => {
  const location = useLocation();
  const { user, formData: initialFormData } = location.state || {};
  const navigate = useNavigate();
 
  const role = location.state?.role; // "Student/Enthu"

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

  const handlePersonalInfoNext = () => {
    if (formData.name && formData.handle && formData.gender && formData.age) {
      navigate("/interests", { state: { user, formData } });
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
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please provide your academic information to complete your professor
            profile
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-24">
        <div className="backdrop-blur-sm rounded-3xl p-12 border border-white/50">
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
                  setFormData({ ...formData, institutionName: e.target.value })
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
                  setFormData({ ...formData, institutionEmail: e.target.value })
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

          {/* Continue Button */}
          <div className="text-center pt-12">
            <button
              onClick={() =>
                navigate("/profile-setup/personal", {
                  state: { user, formData },
                })
              }
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorSetup;
