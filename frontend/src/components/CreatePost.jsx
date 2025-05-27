import React, { useState, useEffect, useRef } from "react";
//test
import {
  Paperclip,
  X,
  Hash,
  AlignLeft,
  FileText,
  Link2,
  BarChart2,
  Smile,
  Image as ImageIcon,
} from "lucide-react";

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

  // Validate form based on selected tab
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (selectedTab !== "poll" && !postContent.trim()) {
      newErrors.content = "Content is required";
    }

    if (selectedTab === "poll") {
      const validOptions = pollOptions.filter((opt) => opt.trim()).length;
      if (validOptions < 2) {
        newErrors.poll = "At least 2 options are required";
      }
    }

    if (selectedTab === "link" && postContent.trim()) {
      try {
        new URL(postContent);
      } catch {
        newErrors.content = "Please enter a valid URL";
      }
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
        title,
        content: postContent,
        tags,
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
      e.preventDefault(); // Prevent form submission
      const normalizedTag = currentTag.trim().toLowerCase();
      if (!tags.includes(normalizedTag)) {
        setTags([...tags, normalizedTag]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
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
    if (file) {
      // Validate file type
      if (!file.type.match("image.*")) {
        setErrors({ ...errors, image: "Please select an image file" });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image must be less than 5MB" });
        return;
      }

      setImage(file);
      setErrors({ ...errors, image: null });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                selectedTab === "post"
                  ? "text-gray-900 border-b-2 border-gray-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setSelectedTab("post")}>
              <AlignLeft size={16} /> Post
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                selectedTab === "article"
                  ? "text-gray-900 border-b-2 border-gray-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setSelectedTab("article")}>
              <FileText size={16} /> Article
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                selectedTab === "link"
                  ? "text-gray-900 border-b-2 border-gray-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setSelectedTab("link")}>
              <Link2 size={16} /> Link
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                selectedTab === "poll"
                  ? "text-gray-900 border-b-2 border-gray-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setSelectedTab("poll")}>
              <BarChart2 size={16} /> Poll
            </button>
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
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {selectedTab === "post" && (
              <div className="mb-4">
                <textarea
                  placeholder="What are your thoughts?"
                  className={`w-full bg-white border ${
                    errors.content ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 min-h-[150px]`}
                  value={postContent}
                  onChange={(e) => {
                    setPostContent(e.target.value);
                    if (errors.content) setErrors({ ...errors, content: null });
                  }}
                  maxLength={1000}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>
            )}

            {selectedTab === "article" && (
              <div className="mb-4">
                <textarea
                  placeholder="Write your article content here..."
                  className={`w-full bg-white border ${
                    errors.content ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 min-h-[250px]`}
                  value={postContent}
                  onChange={(e) => {
                    setPostContent(e.target.value);
                    if (errors.content) setErrors({ ...errors, content: null });
                  }}
                  maxLength={5000}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>
            )}

            {selectedTab === "link" && (
              <div className="mb-4">
                <input
                  type="url"
                  placeholder="Paste link URL"
                  className={`w-full bg-white border ${
                    errors.content ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 mb-3`}
                  value={postContent}
                  onChange={(e) => {
                    setPostContent(e.target.value);
                    if (errors.content) setErrors({ ...errors, content: null });
                  }}
                />
                {errors.content && (
                  <p className="mt-1 -mt-2 mb-2 text-sm text-red-600">
                    {errors.content}
                  </p>
                )}
                <textarea
                  placeholder="Add a description (optional)"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 min-h-[100px]"
                  maxLength={500}
                />
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
                          errors.poll && !option.trim()
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"`}
                        value={option}
                        onChange={(e) =>
                          handlePollOptionChange(index, e.target.value)
                        }
                        maxLength={100}
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
                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="text-gray-500 text-sm font-medium hover:text-gray-500 flex items-center">
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

            {/* Image upload and preview */}
            {(selectedTab === "post" || selectedTab === "article") && (
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview ? (
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
                ) : (
                  " "
                )}
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <Hash size={16} className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Add tags (press Enter to add)"
                  className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={addTag}
                  maxLength={20}
                />
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
                {(selectedTab === "post" || selectedTab === "article") && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                      <ImageIcon size={20} />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                      <Paperclip size={20} />
                    </button>
                  </>
                )}
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
                    ? "bg-black/70 text-white cursor-not-allowed"
                    : "bg-gray-600 hover:bg-black text-white"
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
