import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import UserProfileCard from "./UserProfileCard";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Share,
  Bookmark,
  ChevronUp,
  ChevronDown,
  User,
  X,
  Loader2,
  Send,
  ImagePlus,
  Trash2, ChevronLeft, ChevronRight 
} from "lucide-react";
import { formatDate, handleClose as closeHandler } from "../utils/postUtils";
import axios from "axios";

const PostDetail = ({ isModal = false, backgroundLocation = null }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { postId } = useParams();
  const [post, setPost] = useState(state?.post || null);
  const [user, setUser] = useState(state?.user || null);
  console.log(user);

  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const currentUserId = user?._id || user?.sub;

  const [loading, setLoading] = useState(!post);
  const [voted, setVoted] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [voteCount, setVoteCount] = useState(0);
  const [isCommenting, setIsCommenting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
  const [replyContent, setReplyContent] = useState("");
  const [commentVotes, setCommentVotes] = useState({});
  const [simulationActive, setSimulationActive] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Image upload states
  const [commentImage, setCommentImage] = useState(null);
  const [commentImagePreview, setCommentImagePreview] = useState(null);
  const [replyImage, setReplyImage] = useState(null);
  const [replyImagePreview, setReplyImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const hoverTimeoutRef = useRef(null);
  const commentImageInputRef = useRef(null);
  const replyImageInputRef = useRef(null);
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Left swipe
      nextImage();
    } else if (touchEnd - touchStart > 50) {
      // Right swipe
      prevImage();
    }
  };

  // Add these functions for navigation
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === post.imageUrl.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? post.imageUrl.length - 1 : prevIndex - 1
    );
  };
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Image handling functions
  const handleCommentImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setCommentImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setCommentImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleReplyImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setReplyImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setReplyImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeCommentImage = () => {
    setCommentImage(null);
    setCommentImagePreview(null);
    if (commentImageInputRef.current) {
      commentImageInputRef.current.value = "";
    }
  };

  const removeReplyImage = () => {
    setReplyImage(null);
    setReplyImagePreview(null);
    if (replyImageInputRef.current) {
      replyImageInputRef.current.value = "";
    }
  };

  const uploadImage = async (image) => {
    try {
      const formData = new FormData();
      formData.append("file", image);

      const uploadResponse = await axios.post(
        `http://localhost:3000/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const uploadedImageUrl = uploadResponse.data.downloadUrl;
      console.log("Uploaded image URL:", uploadedImageUrl);

      // Extract filename from URL
      if (uploadedImageUrl && uploadedImageUrl.includes("uploads/")) {
        const filename = uploadedImageUrl.split("uploads/")[1];
        return filename;
      }
      return null;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const sortComments = (comments) => {
    return [...comments].sort((a, b) => {
      // Compare image presence first
      const aHasImage = a.imageUrl && a.imageUrl.length > 0;
      const bHasImage = b.imageUrl && b.imageUrl.length > 0;

      if (aHasImage && !bHasImage) return -1;
      if (!aHasImage && bHasImage) return 1;

      // Then compare message length
      if (a.body.length > b.body.length) return -1;
      if (a.body.length < b.body.length) return 1;

      // Finally sort by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  // Fetch post and comments
  useEffect(() => {
    const fetchData = async () => {
      if (!post && postId) {
        try {
          setLoading(true);

          // Fetch post
          const postRes = await fetch(
            `http://localhost:3000/api/posts/${postId}`
          );
          if (!postRes.ok) throw new Error("Failed to fetch post");
          const postData = await postRes.json();
          setPost(postData);

          // Fetch comments
          const commentsRes = await fetch(
            `http://localhost:3000/api/posts/${postId}/comments`
          );
          if (!commentsRes.ok) throw new Error("Failed to fetch comments");
          const commentsData = await commentsRes.json();
          console.log(commentsData);

          setComments(commentsData);
          setVoteCount(postData.upvotes - postData.downvotes);
        } catch (err) {
          console.error("Error fetching data:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [post, postId]);

  useEffect(() => {
    if (!simulationActive) return;

    const intervalTime = 5000;
    let simulationInterval;

    const startSimulation = async () => {
      await simulateComment();
      simulationInterval = setInterval(simulateComment, intervalTime);
    };

    startSimulation();

    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [simulationActive]);

  const handleDeleteComment = async (commentId, userHandle) => {
    // if (!window.confirm("Delete this comment and all its replies?")) return;

    setDeletingCommentId(commentId);
    try {
      const response = await fetch(
        `http://localhost:3000/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ handle: userHandle }),
        }
      );

      if (!response.ok) throw new Error("Delete failed");

      await fetchComments();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const simulateComment = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/simulate-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Simulation failed");

      const data = await res.json();
      console.log("Simulated comment:", data.comment.body);

      fetchComments();

      return data.comment;
    } catch (error) {
      console.error("Simulate comment error:", error);
      return null;
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (!replyContent.trim() || !user || !post) return;

    try {
      setUploadingImage(true);
      let imageUrls = [];

      // Upload image if selected
      if (replyImage) {
        const filename = await uploadImage(replyImage);

        if (filename) {
          imageUrls.push(filename);
          console.log("pushed", filename);
        }
      }

      const replyData = {
        body: replyContent,
        author: user._id || user?.sub,
        handle: user?.handle || user?.userHandle || "Anonymous",
        userDp: user.profilePicture,
        imageUrl: imageUrls,
      };

      const response = await fetch(
        `http://localhost:3000/api/comments/${parentCommentId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(replyData),
        }
      );

      if (!response.ok) throw new Error("Failed to post reply");

      await fetchComments();
      setReplyContent("");
      setReplyingTo(null);
      removeReplyImage();
    } catch (err) {
      console.error("Error posting reply:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || !post) return;

    try {
      setIsCommenting(true);
      setUploadingImage(true);
      let imageUrls = [];

      // Upload image if selected
      if (commentImage) {
        const filename = await uploadImage(commentImage);
        if (filename) {
          imageUrls.push(filename);
        }
      }

      const commentData = {
        body: newComment,
        author: user?._id || user?.sub,
        handle: user?.handle || user?.userHandle || "Anonymous",
        userDp: user.profilePicture,
        imageUrl: imageUrls,
      };

      console.log(commentData);

      const response = await fetch(
        `http://localhost:3000/api/posts/${post._id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(commentData),
        }
      );

      if (!response.ok) throw new Error("Failed to post comment");

      const savedComment = await response.json();
      setComments((prev) => [
        {
          ...savedComment,
          voteCount: 0,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setNewComment("");
      removeCommentImage();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsCommenting(false);
      setUploadingImage(false);
    }
  };

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      const commentsRes = await fetch(
        `http://localhost:3000/api/posts/${postId}/comments`
      );
      if (!commentsRes.ok) throw new Error("Failed to fetch comments");
      const commentsData = await commentsRes.json();
      console.log(commentsData);

      setComments(commentsData);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, fetchComments]);

  const renderComment = (comment, depth = 0) => {
    const isReplying = replyingTo === comment._id;
    
  const sortedReplies = comment.replies ? sortComments(comment.replies) : [];

    return (
      <div
        key={comment._id}
        className={`pl-2 mt-3 ${
          depth > 0 ? "border-l border-[#1E1E1E]" : ""
        } transition-colors duration-200`}>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-0.5">
              <Link
                to={`/n/${comment.handle}`}
                state={{ user: user, handle: comment.handle }}
                className="">
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src={
                    comment.userDp
                      ? `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${comment.userDp}`
                      : "/default-avatar.png"
                  }
                  alt="avatar"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
              </Link>
              <div>
                <Link
                  to={`/n/${comment.handle}`}
                  state={{ user: user, handle: comment.handle }}>
                  <span
                    className="text-sm font-medium text-white hover:underline cursor-pointer"
                    onMouseEnter={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      setHoveredUser({
                        handle: comment.handle,
                        userDp: comment.userDp,
                      });
                      setHoverPosition({
                        top: rect.bottom + window.scrollY,
                        left: rect.left + window.scrollX,
                      });

                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isHoveringCard) {
                        hoverTimeoutRef.current = setTimeout(() => {
                          setHoveredUser(null);
                        }, 300);
                      }
                    }}>
                    n/{comment.handle || "Anonymous"}
                  </span>
                </Link>
                <span className="text-xs text-[#818384] ml-2">
                  {new Date(comment.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>

            <p className="text-[#d7dadc] pl-11 mb-0.5 mr-2">{comment.body}</p>

            {/* Comment Images */}
            {comment.imageUrl && (
              <div className="pl-11 mb-2 mt-1">
                {comment.imageUrl.map((imageUrl, index) => (
                  <div key={index} className="mb-2">
                    <img
                      src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${imageUrl}`}
                      alt="Comment attachment"
                      className="max-w-xs max-h-48 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onError={(e) => (e.target.style.display = "none")}
                      onClick={() =>
                        window.open(
                          `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${imageUrl}`,
                          "_blank"
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="pl-11">
              <div className="pl-0 flex items-center gap-4 mt-0 text-sm text-[#818384]">
                <button
                  onClick={() =>
                    setReplyingTo((prev) =>
                      prev === comment._id ? null : comment._id
                    )
                  }
                  className="hover:text-[#AD49E1] font-medium">
                  {isReplying ? "Cancel" : "Reply"}
                </button>

                {currentUserId === comment.author && (
                  <button
                    onClick={() =>
                      handleDeleteComment(comment._id, user.handle)
                    }
                    disabled={deletingCommentId === comment._id}
                    className={`text-[#818384] hover:text-red-500 font-medium transition-colors ${
                      deletingCommentId === comment._id ? "animate-pulse" : ""
                    }`}>
                    {deletingCommentId === comment._id ? (
                      <Loader2 className="animate-spin h-4 w-4 inline mr-1" />
                    ) : null}
                    Delete
                  </button>
                )}
              </div>

              {isReplying && (
                <div className="mt-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-3 text-white placeholder-[#818384] focus:outline-none focus:border-[#AD49E1]/50 transition-colors"
                    placeholder="Write a reply..."
                    rows={3}
                  />

                  {/* Reply Image Preview */}
                  {replyImagePreview && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={replyImagePreview}
                        alt="Reply preview"
                        className="max-w-xs max-h-32 rounded-lg object-cover"
                      />
                      <button
                        onClick={removeReplyImage}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={replyImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleReplyImageSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => replyImageInputRef.current?.click()}
                        className="flex items-center gap-1 text-[#818384] hover:text-[#AD49E1] transition-colors p-2 rounded-lg hover:bg-[#1E1E1E]">
                        <ImagePlus size={16} />
                        <span className="text-sm">Image</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleReplySubmit(comment._id)}
                      disabled={!replyContent.trim() || uploadingImage}
                      className={`flex items-center gap-2 font-medium py-1.5 px-5 rounded-full text-sm transition-all ${
                        !replyContent.trim() || uploadingImage
                          ? "bg-[#AD49E1]/50 cursor-not-allowed"
                          : "bg-[#AD49E1] hover:bg-[#AD49E1]/90"
                      }`}>
                      {uploadingImage ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {sortedReplies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        </div>
      </div>
    );
  };

  const handleClose = () => closeHandler(isModal, backgroundLocation, navigate);

  if (loading) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A] ${
          isModal ? "backdrop-blur-sm" : ""
        }`}>
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-[#AD49E1] h-10 w-10" />
          <p className="mt-4 text-[#d7dadc]">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A] ${
          isModal ? "backdrop-blur-sm" : ""
        }`}>
        <div className="bg-[#161617] p-8 rounded-2xl text-center">
          <p className="text-xl text-[#d7dadc] mb-4">Post not found</p>
          <button
            onClick={handleClose}
            className="bg-[#AD49E1] hover:bg-[#AD49E1]/90 text-white font-medium py-2 px-6 rounded-full transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isModal
          ? "fixed inset-0 z-50 overflow-y-auto"
          : "min-h-screen bg-[#030303]"
      }`}>
      {isModal && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-[#AD49E1]/20 brightness-100 backdrop-blur-xs transition-opacity"
        />
      )}

      <div
        className={`relative ${
          isModal
            ? "flex items-center justify-center min-h-screen sm:pt-20 sm:pb-10 pt-0"
            : ""
        }`}>
        <div
          className={`bg-[#0A0A0A] sm:rounded-2xl overflow-hidden border border-[#1E1E1E] shadow-2xl ${
            isModal ? "w-full max-w-4xl" : "max-w-4xl mx-auto my-8"
          }`}>
          {/* Header */}
          <div className="sm:p-6 p-2 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-0">
                <img
                  className="w-12 h-12 object-cover object-center"
                  src={post.community_dp}
                  alt="community"
                />
                <div>
                  <Link
                    // key={community._id}
                    to={`/c/${post.communityHandle}`}
                    // state={{ user: currentUser }}
                  >
                    <h2 className="text-white sm:text-base text-sm font-medium">
                      c/{post.communityHandle || "Astronomy"}
                    </h2>
                  </Link>

                  <p className="text-[#818384] sm:text-sm text-sm flex items-center">
                    <span>
                      n/
                      {(post.userHandle || "anonymous")
                        .toLowerCase()
                        .replace(/\s+/g, "")}
                    </span>
                    <span className="mx-1.5">·</span>
                    {formatDate(post.createdAt)} ago
                  </p>
                </div>
              </div>
              <h1 className="sm:text-2xl text-lg font-bold px-1 text-white mt-4 leading-tight">
                {post.title || "Research Summary"}
              </h1>
            </div>

            {isModal && (
              <button
                onClick={handleClose}
                className="text-[#818384] hover:text-white p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="">
            <div className="mb-6 sm:px-6 px-3 text-[#d7dadc] sm:text-lg text-sm leading-relaxed">
              <p className="whitespace-pre-line">{post.description}</p>
            </div>

            {/* {post.imageUrl?.length > 0 && (
              <div className="sm:mb-8 mb-2 sm:px-6 px-0 overflow-hidden">
                <div
                  className={`grid ${
                    post.imageUrl.length === 1
                      ? "grid-cols-1"
                      : "grid-cols-1 sm:grid-cols-2"
                  } gap-4`}>
                  {post.imageUrl.map((image, index) => (
                    <div
                      key={index}
                      className="overflow-hidden sm:rounded-xl bg-black flex items-center justify-center">
                      <img
                        src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${image}`}
                        alt={`Post content ${index + 1}`}
                        className="w-full max-h-[70vh] object-contain cursor-pointer"
                        onError={(e) => (e.target.style.display = "none")}
                        onClick={() =>
                          window.open(
                            `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${image}`,
                            "_blank"
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {post.imageUrl?.length > 0 && (
              <div className="sm:mb-8 mb-2 sm:px-6 px-0 overflow-hidden relative">
                {/* Image container with swipe handlers */}
                <div
                  className="relative overflow-hidden sm:rounded-xl bg-black"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}>
                  {/* Navigation arrows */}
                  {post.imageUrl.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 hidden sm:block"
                        aria-label="Previous image">
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 hidden sm:block"
                        aria-label="Next image">
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}

                  {/* Current image */}
                  <img
                    src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[currentImageIndex]}`}
                    alt={`Post content ${currentImageIndex + 1} of ${
                      post.imageUrl.length
                    }`}
                    className="w-full max-h-[70vh] object-contain cursor-pointer"
                    onError={(e) => (e.target.style.display = "none")}
                    onClick={() =>
                      window.open(
                        `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[currentImageIndex]}`,
                        "_blank"
                      )
                    }
                  />
                </div>

                {/* Dots navigation */}
                {post.imageUrl.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {post.imageUrl.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-1.5 h-1.5 rounded-full ${
                          index === currentImageIndex
                            ? "bg-[#AD49E1]"
                            : "bg-[#818384]"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Engagement Bar */}
            <div className="flex items-center gap-4 text-[#818384] border-t px-10 border-[#1E1E1E] p-5">
              <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                <MessageSquare size={18} />
                <span className="text-sm">{comments.length} Comments</span>
              </button>
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-[#1E1E1E]">
            <h3 className="text-xl font-semibold text-white mb-2">
              Add a comment
            </h3>
            <div className="relative mb-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-4 text-white min-h-[120px] placeholder-[#818384] focus:outline-none focus:border-[#AD49E1]/50 transition-colors"
                placeholder="Share your thoughts..."
              />

              {/* Comment Image Preview */}
              {commentImagePreview && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={commentImagePreview}
                    alt="Comment preview"
                    className="max-w-xs max-h-48 rounded-lg object-cover"
                  />
                  <button
                    onClick={removeCommentImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={commentImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCommentImageSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => commentImageInputRef.current?.click()}
                    className="flex items-center gap-2 text-[#818384] hover:text-[#AD49E1] transition-colors p-2 rounded-lg hover:bg-[#1E1E1E]">
                    <ImagePlus size={18} />
                    <span className="text-sm">Add Image</span>
                  </button>
                </div>

                <button
                  onClick={handleSubmitComment}
                  disabled={
                    isCommenting || !newComment.trim() || uploadingImage
                  }
                  className={`flex items-center gap-2 font-medium cursor-pointer py-2 px-6 rounded-full transition-all ${
                    isCommenting || !newComment.trim() || uploadingImage
                      ? "bg-[#AD49E1]/50 cursor-not-allowed"
                      : "bg-[#AD49E1] hover:bg-[#AD49E1]/90"
                  }`}>
                  {isCommenting || uploadingImage ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      {uploadingImage ? "Uploading..." : "Posting..."}
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Comment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t p-3 border-[#1E1E1E]">
            {comments.length > 0 ? (
              <div className="divide-y divide-[#1E1E1E]">
                {sortComments(comments).map((comment) =>
                  renderComment(comment)
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="inline-block p-4 rounded-full bg-[#161617] mb-4">
                  <MessageSquare className="text-[#818384] w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold text-white">
                  No Comments Yet
                </h4>
                <p className="text-[#818384] mt-2">
                  Be the first to share your thoughts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Card - positioned at the end */}
      {hoveredUser && (
        <UserProfileCard user={hoveredUser} position={hoverPosition} />
      )}
    </div>
  );
};

export default PostDetail;
