// src/components/Post.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Share,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

const Post = ({
  post,
  currentUser,
  isExpanded,
  togglePostExpansion,
  userVote,
  upvoteCount,
  downvoteCount,
  handleVote,
  savedPosts,
  handleSavePost,
  formatDate,
  truncateText,
  formatVoteCount,
  location,
}) => {
  return (
    <article
      className="bg-[#111111] sm:border-b border-[#222] overflow-hidden transition-all duration-500 shadow-2xl hover:shadow-3xl"
      style={{ minHeight: "400px" }}>
      <div className="pt-3 py-2">
        {/* Post Header */}
        <div className="flex items-center justify-between sm:px-6 px-2 mb-1">
          <div className="flex items-center gap-3 mb-1">
            <Link
              to={`/c/${post.communityHandle}`}
              state={{ user: currentUser }}>
              <img
                className="w-12 h-12 object-cover object-center"
                src={post.community_dp}
                alt="community"
              />
            </Link>
            <div>
              <Link
                to={`/c/${post.communityHandle}`}
                state={{ user: currentUser }}>
                <h2 className="text-white font-medium text-[15px]">
                  c/{post.communityHandle || "Astronomy"}
                </h2>
              </Link>
              <p className="text-[#818384] text-[12px] flex items-center">
                <span>
                  n/
                  {(post.userHandle || "anonymous")
                    .toLowerCase()
                    .replace(/\s+/g, "")}
                </span>
                <span className="mx-1.5">•</span> {formatDate(post.createdAt)}{" "}
                ago
              </p>
            </div>
          </div>
          <button className="text-[#a0a2a4] hover:text-white p-2 rounded-full hover:bg-[#1f1f1f] transition-colors duration-200">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Post Title */}
        <Link
          to={`/post/${post._id}`}
          state={{
            post,
            user: currentUser,
            backgroundLocation: location,
          }}
          className="text-[18px] font-bold text-white mb-4 sm:px-6 px-2 leading-tight cursor-pointer hover:text-[#AD49E1] transition-colors duration-300 block"
          onClick={() => togglePostExpansion(post._id)}>
          {post.title || "Research Summary"}
        </Link>

        {/* Post Image */}
        {post.imageUrl?.length > 0 && (
          <div className="relative mb-4 bg-[#101010] overflow-hidden">
            <div className="w-full" style={{ minHeight: "300px" }}>
              <img
                src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[0]}`}
                alt="Post content"
                className={`mx-auto w-full h-auto max-h-[600px] object-contain cursor-pointer transition-all duration-500 ease-in-out ${
                  isExpanded ? "opacity-100 blur-0" : "opacity-100 blur-sm"
                }`}
                style={{
                  transition: "filter 0.4s ease, opacity 0.4s ease",
                }}
                onClick={() => togglePostExpansion(post._id)}
                onLoad={(e) => {
                  e.target.classList.remove("blur-sm");
                }}
              />
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className="mb-0 text-[#d7dadc] sm:px-6 px-2 leading-relaxed">
          {isExpanded ? (
            <p className="text-[14px]">{post.description}</p>
          ) : (
            <p className="text-[14px]">
              {truncateText(post.description)}{" "}
              {post.description && post.description.split(" ").length > 20 && (
                <button
                  onClick={() => togglePostExpansion(post._id)}
                  className="text-[#d7dadc] hover:text-[#d7dadc] cursor-pointer transition-colors duration-300 font-medium">
                  Read more
                </button>
              )}
            </p>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-6">
            <Link
              to={`/post/${post._id}`}
              state={{
                post,
                user: currentUser,
                backgroundLocation: location,
              }}
              className="flex items-center gap-2 text-[#818384] hover:text-[#AD49E1] hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm font-medium">
              <MessageSquare size={16} />
              <span>{post.comments.length}</span>
            </Link>

            {/* Vote buttons */}
            <div className="flex items-center">
              <button
                onClick={() => handleVote(post._id, "up")}
                className={`flex items-center gap-1 px-3 py-2 transition-all duration-200 ${
                  userVote === "up"
                    ? "text-red-600"
                    : "text-[#818384] hover:text-red-500"
                }`}>
                <ChevronUp size={16} />
                <span className="text-sm font-medium">
                  {formatVoteCount(upvoteCount)}
                </span>
              </button>
              <button
                onClick={() => handleVote(post._id, "down")}
                className={`flex items-center gap-1 px-3 py-2 transition-all duration-200 ${
                  userVote === "down"
                    ? "text-[#7193ff]"
                    : "text-[#818384] hover:text-[#7193ff]"
                }`}>
                <ChevronDown size={16} />
                <span className="text-sm font-medium">
                  {formatVoteCount(downvoteCount)}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm">
              <Share size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={() => handleSavePost(post._id)}
              className={`flex items-center gap-2 hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm ${
                savedPosts.has(post._id)
                  ? "text-[#AD49E1] hover:text-[#AD49E1]"
                  : "text-[#818384] hover:text-white"
              }`}>
              <Bookmark
                size={16}
                fill={savedPosts.has(post._id) ? "#AD49E1" : "none"}
              />
              <span className="hidden sm:inline">
                {savedPosts.has(post._id) ? "Saved" : "Save"}
              </span>
            </button>

            {isExpanded && (
              <button
                onClick={() => togglePostExpansion(post._id)}
                className="flex items-center gap-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm">
                <ChevronUp size={16} />
                <span className="hidden sm:inline">Collapse</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default Post;
