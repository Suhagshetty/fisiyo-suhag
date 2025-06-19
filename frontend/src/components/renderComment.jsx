

import { useLocation, useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";

import { Link } from "react-router-dom";
const RenderComment = (comment, user, currentUserId, depth = 0) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const isReplying = replyingTo === comment._id;
    const [deletingCommentId, setDeletingCommentId] = useState(null);
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

    
  const handleReplySubmit = async (parentCommentId) => {
    if (!replyContent.trim() || !user || !post) return;

    try {
      const replyData = {
        body: replyContent,
        author: user._id || user?.sub,
        handle: user?.handle || user?.userHandle || "Anonymous",
        userDp: user.profilePicture,
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
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

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

              <div className="flex items-center gap-2">
                {/* <button
                  onClick={() => handleCommentVote(comment._id, "up")}
                  className={`p-1.5 rounded-full transition-colors ${
                    commentVotes[comment._id] === "up"
                      ? "text-[#AD49E1] bg-[#AD49E1]/10"
                      : "hover:bg-[#AD49E1]/10 hover:text-[#AD49E1]"
                  }`}>
                  <ChevronUp size={18} />
                </button>
                <span className="text-xs font-bold text-[#d7dadc]">
                  {comment.voteCount || 0}
                </span>
                <button
                  onClick={() => handleCommentVote(comment._id, "down")}
                  className={`p-1.5 rounded-full transition-colors ${
                    commentVotes[comment._id] === "down"
                      ? "text-[#7193ff] bg-[#7193ff]/10"
                      : "hover:bg-[#7193ff]/10 hover:text-[#7193ff]"
                  }`}>
                  <ChevronDown size={18} />
                </button> */}
              </div>

              {currentUserId === comment.author && (
                <button
                  onClick={() => handleDeleteComment(comment._id, user.handle)}
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
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleReplySubmit(comment._id)}
                    disabled={!replyContent.trim()}
                    className={`flex items-center gap-2 font-medium py-1.5 px-5 rounded-full text-sm transition-all ${
                      !replyContent.trim()
                        ? "bg-[#AD49E1]/50 cursor-not-allowed"
                        : "bg-[#AD49E1] hover:bg-[#AD49E1]/90"
                    }`}>
                    <Send size={14} />
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>

          {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
        </div>
      </div>
    </div>
  );
};

export default  RenderComment