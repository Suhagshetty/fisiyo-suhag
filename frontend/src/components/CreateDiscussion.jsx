import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";

const MAX_BODY_LENGTH = 5000;

const CreateDiscussion = ({
  isModal = true,
  onClose,
  onSubmit,
  backgroundLocation,
  post,
  parentComment = null,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = location.state?.user;
  const community = post?.community?.handle || location.state?.community?.name;
  const community_dp = post?.community?.url || location.state?.community?.url;
  const community_id = post?.community?._id || location.state?.community?.id;

  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const textareaRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};

    if (!body.trim()) {
      newErrors.body = "Comment cannot be empty";
    } else if (body.length > MAX_BODY_LENGTH) {
      newErrors.body = `Comment must be less than ${MAX_BODY_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBodyChange = useCallback((e) => {
    setBody(e.target.value);
    setErrors((prev) => (prev.body ? { ...prev, body: null } : prev));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const discussionData = {
        post: post._id,
        author: currentUser._id,
        userHandle: currentUser.handle,
        community: community_id,
        communityHandle: community,
        community_dp: community_dp,
        body: body.trim(),
        parentComment: parentComment?._id || null,
      };

      const response = await axios.post(
        "http://localhost:3000/api/create-discussion",
        discussionData
      );

      console.log("Discussion submitted:", response.data);

      resetForm();
      handleClose();
    } catch (error) {
      console.error(
        "Error submitting discussion:",
        error.response?.data || error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setBody("");
    setErrors({});
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
        navigate(`/post/${post._id}`, { state: { user: currentUser } });
      }
    }
  }, [onClose, backgroundLocation, navigate, currentUser, post]);

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const createDiscussionContent = () => (
    <div
      className={`bg-[#0A0A0A] ${
        isModal ? "rounded-2xl border border-[#1E1E1E] shadow-2xl" : ""
      } w-full ${isModal ? "max-w-3xl max-h-[90vh]" : "min-h-screen"} ${
        isModal ? "overflow-y-auto" : "overflow-y-auto"
      }`}>
      {/* Header */}
      <div
        className={`${
          isModal
            ? "p-6 border-b border-[#1E1E1E]"
            : "p-6 border-b border-[#1E1E1E]"
        } flex justify-between items-center sticky top-0 bg-[#0A0A0A] z-10`}>
        <div className="flex items-center gap-3">
          <img
            className="w-12 h-12   object-cover object-center"
            src={community_dp}
            alt="community"
          />
          <div className="flex flex-col">
            <h2 className="text-white font-medium text-base">c/{community}</h2>
            <p className="text-[#818384] text-sm">
              {parentComment ? "Reply to Comment" : "Create Comment"}
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="text-[#818384] hover:text-white p-2 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className={`${isModal ? "p-6" : "p-6"}`}>
        <form onSubmit={handleSubmit}>
          {/* Parent Comment Preview */}
          {parentComment && (
            <div className="mb-6 bg-[#161617] border border-[#1E1E1E] p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex flex-col">
                  <span className="text-[#818384] text-sm">
                    Replying to{" "}
                    <span className="text-[#AD49E1]">
                      u/{parentComment.userHandle}
                    </span>
                  </span>
                  <p className="text-white text-sm mt-2 line-clamp-2">
                    {parentComment.body}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Body Input */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-3 text-lg">
              {parentComment ? "Your Reply" : "Your Comment"}
            </label>
            <textarea
              ref={textareaRef}
              placeholder={
                parentComment
                  ? "Write your reply..."
                  : "What are your thoughts?"
              }
              className={`w-full bg-[#161617] border ${
                errors.body ? "border-red-500" : "border-[#1E1E1E]"
              } rounded-xl px-4 py-2 text-white placeholder-[#818384] min-h-[180px] focus:outline-none focus:border-[#AD49E1]/50 transition-colors resize-none`}
              value={body}
              onChange={handleBodyChange}
            />
            <div className="mt-2 flex justify-between text-sm">
              {errors.body ? (
                <span className="text-red-500">{errors.body}</span>
              ) : (
                <span>&nbsp;</span>
              )}
              <span className="text-[#818384]">
                {body.length}/{MAX_BODY_LENGTH}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 pb-4 border-t border-[#1E1E1E] flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 font-medium py-3 px-8 rounded-full transition-all ${
                isSubmitting
                  ? "bg-[#AD49E1]/50 text-white cursor-not-allowed"
                  : "bg-[#AD49E1] hover:bg-[#AD49E1]/90 text-white"
              }`}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  {parentComment ? "Posting Reply..." : "Posting Comment..."}
                </>
              ) : parentComment ? (
                "Post Reply"
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 bg-[#AD49E1]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}>
        {createDiscussionContent()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] flex items-start justify-center pt-8">
      {createDiscussionContent()}
    </div>
  );
};

export default CreateDiscussion;
