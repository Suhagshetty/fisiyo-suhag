import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Hash, Smile, Image, ArrowLeft } from "lucide-react";
import axios from "axios";

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 1000;
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

  const [postContent, setPostContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
      let uploadedImageUrl = null;
 
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadResponse = await axios.post(
          `http://localhost:3000/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        uploadedImageUrl = uploadResponse.data.downloadUrl;
        console.log("Uploaded image URL:", uploadedImageUrl);
      }

      const postData = {
        title: title.trim(),
        description: postContent.trim(),
        tags: tags.slice(0, MAX_TAGS),
        imageUrl: uploadedImageUrl?.split("uploads/")[1] || null,
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
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select an image file" }));
      return;
    }

    setImage(file);
    setErrors((prev) => ({ ...prev, image: null }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      } w-full ${
        isModal ? "max-w-2xl max-h-[90vh]" : "min-h-screen"
      } overflow-y-auto`}>
      <div
        className={`${
          isModal
            ? "p-4 border-b border-gray-200"
            : "p-6 border-b border-gray-200"
        } flex justify-between items-center sticky top-0 bg-white z-10`}>
        <div className="flex items-center">
          {!isModal && (
            <button
              onClick={handleClose}
              className="mr-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-medium text-gray-900">Create Post</h2>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className={`${isModal ? "p-4" : "p-6"}`}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Title"
              className={`w-full bg-white border ${
                errors.title ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500`}
              value={title}
              onChange={handleTitleChange}
            />
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              {errors.title ? (
                <span className="text-red-600">{errors.title}</span>
              ) : (
                <span>&nbsp;</span>
              )}
              <span>
                {title.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <textarea
              placeholder="What are your thoughts?"
              className={`w-full bg-white border ${
                errors.content ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 ${
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
              <span>
                {postContent.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview && (
              <div className="relative mb-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto max-h-80 object-contain rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
                  <X size={16} />
                </button>
              </div>
            )}
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-2">
              <Image size={16} />
              {image ? "Change image" : "Add image"}
            </button>
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
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
