import React, { useState, useEffect, useRef } from "react";
import {
  Paperclip,
  X,
  Hash,
  AlignLeft,
  FileText,
  MessageCircle,
  HelpCircle,
  BarChart2,
  Smile,
  Image as ImageIcon,
} from "lucide-react";

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = {
  post: 1000,
  discussion: 1000,
  qa: 1000,
  article: 5000,
};
const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;
const MAX_POLL_OPTIONS = 6;

const CreatePost = ({ onClose, onSubmit }) => {
  const [postContent, setPostContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState("post");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }

    // Content validation for non-poll types
    if (selectedTab !== "poll") {
      if (!postContent.trim()) {
        newErrors.content = "Content is required";
      } else if (postContent.length > MAX_CONTENT_LENGTH[selectedTab]) {
        newErrors.content = `Content must be less than ${MAX_CONTENT_LENGTH[selectedTab]} characters (${postContent.length}/${MAX_CONTENT_LENGTH[selectedTab]})`;
      }
    }

    // Poll validation
    if (selectedTab === "poll") {
      const validOptions = pollOptions.filter((opt) => opt.trim()).length;
      if (validOptions < 2) {
        newErrors.poll = "At least 2 options are required";
      }

      // Validate individual poll options
      pollOptions.forEach((opt, index) => {
        if (opt.length > 100) {
          newErrors.poll = `Option ${
            index + 1
          } must be less than 100 characters`;
        }
      });
    }

    // Tag validation
    if (tags.length > MAX_TAGS) {
      newErrors.tags = `Maximum ${MAX_TAGS} tags allowed`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const postData = {
        title: title.trim(),
        content: postContent.trim(),
        tags: tags.slice(0, MAX_TAGS),
        type: selectedTab,
        ...(selectedTab === "poll" && {
          options: pollOptions.filter((opt) => opt.trim()),
          allowMultipleVotes: document.getElementById("multiple-votes").checked,
          hasDuration: document.getElementById("poll-duration").checked,
        }),
        ...(image && { image }),
      };

      await onSubmit(postData);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPostContent("");
    setTitle("");
    setTags([]);
    setPollOptions(["", ""]);
    setErrors({});
    setImage(null);
    setImagePreview(null);
  };

  const addTag = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      const normalizedTag = currentTag
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      if (tags.length >= MAX_TAGS) {
        setErrors({ ...errors, tags: `Maximum ${MAX_TAGS} tags allowed` });
        return;
      }

      if (normalizedTag.length > MAX_TAG_LENGTH) {
        setErrors({
          ...errors,
          tags: `Tags must be less than ${MAX_TAG_LENGTH} characters`,
        });
        return;
      }

      if (!/^[a-zA-Z0-9-]+$/.test(normalizedTag)) {
        setErrors({
          ...errors,
          tags: "Tags can only contain letters, numbers, and hyphens",
        });
        return;
      }

      if (!tags.includes(normalizedTag)) {
        setTags([...tags, normalizedTag]);
        setErrors({ ...errors, tags: null });
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value.slice(0, 100);
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < MAX_POLL_OPTIONS) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, image: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: "Image must be less than 5MB" });
      return;
    }

    setImage(file);
    setErrors({ ...errors, image: null });

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const getContentPlaceholder = () => {
    switch (selectedTab) {
      case "qa":
        return "Ask your question...";
      case "discussion":
        return "Start a discussion...";
      case "article":
        return "Write your article content here...";
      default:
        return "What are your thoughts?";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-medium text-gray-900">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
            {["post", "article", "discussion", "qa", "poll"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`px-4 py-2 font-medium text-sm flex items-center gap-2 shrink-0 ${
                  selectedTab === tab
                    ? "text-gray-900 border-b-2 border-gray-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setSelectedTab(tab)}>
                {
                  {
                    post: <AlignLeft size={16} />,
                    article: <FileText size={16} />,
                    discussion: <MessageCircle size={16} />,
                    qa: <HelpCircle size={16} />,
                    poll: <BarChart2 size={16} />,
                  }[tab]
                }
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Title"
                className={`w-full bg-white border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500`}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH));
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
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

            {selectedTab !== "poll" && (
              <div className="mb-4">
                <textarea
                  placeholder={getContentPlaceholder()}
                  className={`w-full bg-white border ${
                    errors.content ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 min-h-[150px]`}
                  value={postContent}
                  onChange={(e) => {
                    setPostContent(
                      e.target.value.slice(0, MAX_CONTENT_LENGTH[selectedTab])
                    );
                    if (errors.content) setErrors({ ...errors, content: null });
                  }}
                />
                <div className="mt-1 flex justify-between text-sm text-gray-500">
                  {errors.content ? (
                    <span className="text-red-600">{errors.content}</span>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                  <span>
                    {postContent.length}/{MAX_CONTENT_LENGTH[selectedTab]}
                  </span>
                </div>
              </div>
            )}

            {selectedTab === "poll" && (
              <div className="mb-4">
                <div className="space-y-2 mb-3">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        className={`flex-1 bg-white border ${
                          errors.poll ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500`}
                        value={option}
                        onChange={(e) =>
                          handlePollOptionChange(index, e.target.value)
                        }
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(index)}
                          className="text-gray-500 hover:text-red-500 p-1 rounded-full">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollOptions.length < MAX_POLL_OPTIONS && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="text-gray-500 text-sm font-medium hover:text-gray-700 flex items-center">
                    <span className="mr-1">+</span> Add option
                  </button>
                )}
                {errors.poll && (
                  <p className="mt-2 text-sm text-red-600">{errors.poll}</p>
                )}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      id="multiple-votes"
                      className="mr-2 rounded border-gray-300 text-gray-500 focus:ring-gray-500"
                    />
                    <label htmlFor="multiple-votes">Allow multiple votes</label>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      id="poll-duration"
                      className="mr-2 rounded border-gray-300 text-gray-500 focus:ring-gray-500"
                    />
                    <label htmlFor="poll-duration">Set poll duration</label>
                  </div>
                </div>
              </div>
            )}

            {selectedTab !== "poll" && (
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
                  onClick={() => fileInputRef.current.click()}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-2">
                  <ImageIcon size={16} />
                  {image ? "Change image" : "Add image"}
                </button>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <Hash size={16} className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder={`Add tags (max ${MAX_TAGS}, press Enter to add)`}
                  className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
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
                {selectedTab !== "poll" && (
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <Paperclip size={20} />
                  </button>
                )}
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
    </div>
  );
};

export default CreatePost;
