import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronUp, ChevronDown, Loader2, Send } from "lucide-react";

const Comment = ({
  comment,
  depth = 0,
  currentUserId,
  user,
  onDeleteComment,
  onReplySubmit,
  onCommentVote,
  deletingCommentId,
  onUserHover,
  isHoveringCard,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const handleReply = () => {
    if (isReplying) {
      setIsReplying(false);
      setReplyContent("");
    } else {
      setIsReplying(true);
    }
  };

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReplySubmit(comment._id, replyContent);
      setReplyContent("");
      setIsReplying(false);
    }
  };

  return (
    <div
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
                  onMouseEnter={(e) => onUserHover(e, comment)}
                  onMouseLeave={() => !isHoveringCard && onUserHover(null)}>
                  n/{comment.handle || "Anonymous"}
                </span>
              </Link>
              <span className="text-xs text-[#818384] ml-2">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>

          <p className="text-[#d7dadc] pl-11 mb-0.5 mr-2">{comment.body}</p>

          <div className="pl-11">
            <div className="pl-0 flex items-center gap-4 mt-0 text-sm text-[#818384]">
              <button
                onClick={handleReply}
                className="hover:text-[#AD49E1] font-medium">
                {isReplying ? "Cancel" : "Reply"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCommentVote(comment._id, "up")}
                  className={`p-1.5 rounded-full transition-colors ${
                    comment.voteStatus === "up"
                      ? "text-[#AD49E1] bg-[#AD49E1]/10"
                      : "hover:bg-[#AD49E1]/10 hover:text-[#AD49E1]"
                  }`}>
                  <ChevronUp size={18} />
                </button>
                <span className="text-xs font-bold text-[#d7dadc]">
                  {comment.voteCount || 0}
                </span>
                <button
                  onClick={() => onCommentVote(comment._id, "down")}
                  className={`p-1.5 rounded-full transition-colors ${
                    comment.voteStatus === "down"
                      ? "text-[#7193ff] bg-[#7193ff]/10"
                      : "hover:bg-[#7193ff]/10 hover:text-[#7193ff]"
                  }`}>
                  <ChevronDown size={18} />
                </button>
              </div>

              {currentUserId === comment.author && (
                <button
                  onClick={() => onDeleteComment(comment._id, user.handle)}
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
                    onClick={handleSubmitReply}
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

          {comment.replies?.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              user={user}
              onDeleteComment={onDeleteComment}
              onReplySubmit={onReplySubmit}
              onCommentVote={onCommentVote}
              deletingCommentId={deletingCommentId}
              onUserHover={onUserHover}
              isHoveringCard={isHoveringCard}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Comment;
