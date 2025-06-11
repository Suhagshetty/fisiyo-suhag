import React, { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const CommunitySetup = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user);
  console.log(currentUser);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    isPrivate: false,
    requirePostApproval: false,
    createdBy: currentUser._id,
    defaultSort: "hot",
    colorPrimary: "#0079D3",
    colorSecondary: "#FFFFFF",
    rules: [{ title: "", description: "" }],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRuleChange = (index, field, value) => {
    const updatedRules = [...formData.rules];
    updatedRules[index][field] = value;
    setFormData((prev) => ({ ...prev, rules: updatedRules }));
  };

  const addRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, { title: "", description: "" }],
    }));
  };

  const removeRule = (index) => {
    const updatedRules = formData.rules.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, rules: updatedRules }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload avatar
      let avatarUrl = "";
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append("file", avatarFile);
        const avatarRes = await axios.post(
          "http://localhost:3000/upload",
          avatarFormData
        );
        avatarUrl = avatarRes.data.downloadUrl;
      }

      // Upload banner
      let bannerUrl = "";
      if (bannerFile) {
        const bannerFormData = new FormData();
        bannerFormData.append("file", bannerFile);
        const bannerRes = await axios.post(
          "http://localhost:3000/upload",
          bannerFormData
        );
        bannerUrl = bannerRes.data.downloadUrl;
      }

      // Prepare community data
      const communityData = {
        ...formData,
        avatarUrl,
        bannerUrl,
        memberCount: 0,
        postCount: 0,
      };
      console.log(communityData);

      // Submit to backend
      const response = await axios.post(
        "http://localhost:3000/api/communities",
        communityData
      );

      console.log("Community created:", response.data);
      console.log(`/c/${response.data.name}`);
      navigate(`/c/${response.data.name}`, {
        state: { user: currentUser },
      });
    } catch (error) {
      console.error("Creation failed:", error.response?.data || error.message);
      alert("Failed to create community");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Community</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium">
              Name* (lowercase identifier)
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Display Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium">Avatar Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files[0])}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files[0])}
              className="w-full"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleInputChange}
                className="rounded"
              />
              <span>Private Community</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="requirePostApproval"
                checked={formData.requirePostApproval}
                onChange={handleInputChange}
                className="rounded"
              />
              <span>Require Post Approval</span>
            </label>
          </div>

          <div>
            <label className="block mb-2 font-medium">Default Sort</label>
            <select
              name="defaultSort"
              value={formData.defaultSort}
              onChange={handleInputChange}
              className="w-full p-2 border rounded">
              <option value="hot">Hot</option>
              <option value="new">New</option>
              <option value="top">Top</option>
            </select>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium">Primary Color</label>
            <input
              type="color"
              name="colorPrimary"
              value={formData.colorPrimary}
              onChange={handleInputChange}
              className="w-full h-10"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Secondary Color</label>
            <input
              type="color"
              name="colorSecondary"
              value={formData.colorSecondary}
              onChange={handleInputChange}
              className="w-full h-10"
            />
          </div>
        </div>

        {/* Rules */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Community Rules</h2>
            <button
              type="button"
              onClick={addRule}
              className="bg-blue-500 text-white px-4 py-2 rounded">
              Add Rule
            </button>
          </div>

          {formData.rules.map((rule, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="flex justify-between mb-2">
                <h3 className="font-medium">Rule #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="text-red-500">
                  Remove
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Rule Title</label>
                  <input
                    type="text"
                    value={rule.title}
                    onChange={(e) =>
                      handleRuleChange(index, "title", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">Description</label>
                  <textarea
                    value={rule.description}
                    onChange={(e) =>
                      handleRuleChange(index, "description", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 text-white px-6 py-3 rounded disabled:opacity-50">
          {isSubmitting ? "Creating..." : "Create Community"}
        </button>
      </form>
    </div>
  );
};

export default CommunitySetup;
