import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Hash, Smile, Image, ArrowLeft } from "lucide-react";
import axios from "axios";

const MAX_TITLE_LENGTH = 1000;
const MAX_CONTENT_LENGTH = 10000;
const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;

const CreatePost = ({
  isModal = true,
  onClose,
  onSubmit,
  backgroundLocation,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = location.state?.user;
  console.log(currentUser);
  const community = location.state?.community.name;
  const community_dp = location.state?.community.url;
  const community_id = location.state?.community.id;
  console.log(community);
  console.log(community_dp);
  console.log(community_id);

  const [postContent, setPostContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }

    if (!postContent.trim()) {
      newErrors.content = "Content is required";
    } else if (postContent.length > MAX_CONTENT_LENGTH) {
      newErrors.content = `Content must be less than ${MAX_CONTENT_LENGTH} characters (${postContent.length}/${MAX_CONTENT_LENGTH})`;
    }

    if (tags.length > MAX_TAGS) {
      newErrors.tags = `Maximum ${MAX_TAGS} tags allowed`;
    }

    if (images.length > 5) {
      newErrors.image = "Maximum 5 images allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; 
  };

  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
    setErrors((prev) => (prev.title ? { ...prev, title: null } : prev));
  }, []);

  const handleContentChange = useCallback((e) => {
    setPostContent(e.target.value);
    setErrors((prev) => (prev.content ? { ...prev, content: null } : prev));
  }, []);

  const handleTagChange = useCallback((e) => {
    setCurrentTag(e.target.value);
  }, []);



const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  try {
    let imageUrls = [];

    if (images.length > 0) {
      // Upload all images in parallel
      const uploadPromises = images.map(async (image) => {
        const formData = new FormData();
        formData.append("file", image);

        const uploadResponse = await axios.post(
          `http://localhost:3000/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        // Return only the filename portion
        return uploadResponse.data.downloadUrl.split("uploads/")[1];
      });

      // Wait for all uploads to complete
      imageUrls = await Promise.all(uploadPromises);
    }

    const postData = {
      title: title.trim(),
      description: postContent.trim(),
      tags: tags.slice(0, MAX_TAGS),
      imageUrl: imageUrls, // Should be array of filenames
      author: currentUser._id,
      userHandle: currentUser.handle,
      community: community_id,
      communityHandle: community,
      community_dp: community_dp,
    };

    console.log("Final post data:", postData);

    const response = await axios.post(
      "http://localhost:3000/api/create-post",
      postData
    );

    console.log("Post submitted to DB:", response.data);

    resetForm();
    handleClose();
  } catch (error) {
    console.error(
      "Error submitting post:",
      error.response?.data || error.message
    );
  } finally {
    setIsSubmitting(false);
  }
};

  const resetForm = () => {
    setPostContent("");
    setTitle("");
    setTags([]);
    setErrors({});
    setImage(null);
    setImagePreview(null);
    setCurrentTag("");
  };

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      if (backgroundLocation) {
        navigate(backgroundLocation.pathname, {
          state: { user: currentUser },
        });
      } else {
        navigate("/feed", { state: { user: currentUser } });
      }
    }
  }, [onClose, backgroundLocation, navigate, currentUser]);

  const addTag = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      const normalizedTag = currentTag
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      if (tags.length >= MAX_TAGS) {
        setErrors((prev) => ({
          ...prev,
          tags: `Maximum ${MAX_TAGS} tags allowed`,
        }));
        return;
      }

      if (normalizedTag.length > MAX_TAG_LENGTH) {
        setErrors((prev) => ({
          ...prev,
          tags: `Tags must be less than ${MAX_TAG_LENGTH} characters`,
        }));
        return;
      }

      if (!/^[a-zA-Z0-9-]+$/.test(normalizedTag)) {
        setErrors((prev) => ({
          ...prev,
          tags: "Tags can only contain letters, numbers, and hyphens",
        }));
        return;
      }

      if (!tags.includes(normalizedTag)) {
        setTags((prev) => [...prev, normalizedTag]);
        setErrors((prev) => ({ ...prev, tags: null }));
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };
 
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validImages = files.filter(
      (file) =>
        file.type.startsWith("image/") && images.length + files.length <= 5
    );

    if (validImages.length === 0) {
      setErrors({
        image: "Please select valid image files (max 5 total)",
      });
      return;
    }

    const readImages = validImages.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readImages)
      .then((previews) => {
        setImages((prev) => [...prev, ...validImages]);
        setImagePreviews((prev) => [...prev, ...previews]);
        setErrors((prev) => ({ ...prev, image: null }));
      })
      .catch(() => {
        setErrors((prev) => ({
          ...prev,
          image: "Failed to preview image(s)",
        }));
      });
  };
  
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBackdropClick = (e) => {
    if (isModal && e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const createPostContent = () => (
    <div
      className={`bg-white ${
        isModal ? "rounded-lg border border-gray-200 shadow-xl" : ""
      } w-full ${isModal ? "max-w-2xl max-h-screen" : "min-h-screen"} ${
        isModal ? "overflow-scroll" : "overflow-y-auto"
      }`}>
      <div
        className={`${
          isModal
            ? "p-4 border-b border-gray-200"
            : "p-6 border-b border-gray-200"
        } flex justify-between items-center sticky top-0 bg-white z-10`}>
        <div className="flex items-center gap-2 mb-1">
          {/* Community Image */}
          <img
            className="w-12 h-12   object-cover object-center"
            src={community_dp || "/placeholder.jpg"} // optional fallback
            alt="community"
          />

          {/* Name + Members stacked */}
          <div className="flex flex-col">
            <h2 className="text-black font-medium text-sm sm:text-base">
              c/{community?.handle || community || "unknown"}
            </h2>
            <p className="text-[#818384] text-xs sm:text-sm">
              {community?.membersCount || 0} members
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className={`${isModal ? "p-4" : "p-6"}`}>
        <form>
          {/* onSubmit={handleSubmit} */}
          <div className="mb-0">
            <input
              type="text"
              placeholder="Title"
              className={`w-full text-lg font-bold bg-white  ${
                errors.title ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-0 text-gray-900 placeholder-gray-500 focus:outline-none `}
              value={title}
              onChange={handleTitleChange}
            />
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              {errors.title ? (
                <span className="text-red-600">{errors.title}</span>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
          </div>
          <div className="mb-0">
            <textarea
              placeholder="What are your thoughts?"
              className={`w-full text-base bg-white  ${
                errors.content ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-0 text-gray-900 placeholder-gray-500 focus:outline-none  ${
                isModal ? "min-h-[150px]" : "min-h-[200px]"
              }`}
              value={postContent}
              onChange={handleContentChange}
            />
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              {errors.content ? (
                <span className="text-red-600">{errors.content}</span>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
          </div>
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              multiple // Allow multiple selection
              className="hidden"
            />

            <div className="grid grid-cols-5 gap-2 mb-2">
              {imagePreviews.slice(0, 5).map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-0.5 rounded-full hover:bg-black/70">
                    <X size={14} />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-2 mt-2"
              disabled={images.length >= 5}>
              <Image size={16} />
              {images.length > 0
                ? `Add more images (${5 - images.length} remaining)`
                : "Add images (up to 5)"}
            </button>
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>
          <div className="mb-4">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <Hash size={16} className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder={`Add tags (max ${MAX_TAGS}, press Enter to add)`}
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
                value={currentTag}
                onChange={handleTagChange}
                onKeyDown={addTag}
                maxLength={MAX_TAG_LENGTH}
              />
            </div>
            <div className="mt-1 flex justify-between">
              {errors.tags && (
                <span className="text-red-600 text-sm">{errors.tags}</span>
              )}
              <span className="text-sm text-gray-500">
                {tags.length}/{MAX_TAGS}
              </span>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-gray-500 hover:text-gray-700">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                <Smile size={20} />
              </button>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className={`px-6 py-2 rounded-full cursor-pointer font-medium ${
                isSubmitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gray-800 hover:bg-black text-white"
              }`}>
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0  bg-[#AD49E1]/30 backdrop-blur-xs transition-opacity flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}>
        {createPostContent()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-8">
      {createPostContent()}
    </div>
  );
};

export default CreatePost;
