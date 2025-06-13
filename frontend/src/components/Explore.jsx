import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Search, Flame, Bookmark, Hash } from "lucide-react";
import useFeedData from "../hooks/useFeedData";
import Post from "./Post";

const Explore = () => {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser] = useState(location.state?.user || null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingTags, setTrendingTags] = useState([]);

  const {
    posts,
    loading,
    error,
    expandedPosts,
    votedPosts,
    upvoteCounts,
    savedPosts,
    downvoteCounts,
    togglePostExpansion,
    handleSavePost,
    handleVote,
  } = useFeedData(currentUser, user);

  // Extract trending tags from posts
  useEffect(() => {
    if (posts.length > 0) {
      const tagCount = {};

      posts.forEach((post) => {
        if (post.tags) {
          post.tags.forEach((tag) => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        }
      });

      const sortedTags = Object.entries(tagCount)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTrendingTags(sortedTags);
    }
  }, [posts]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === "all") return true;
    return post.tags && post.tags.includes(activeFilter);
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e1e1e1]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#222] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1
            className="text-2xl font-light text-white"
            style={{ fontFamily: "Playfair Display, serif" }}>
            Explore
          </h1>
          {isAuthenticated && (
            <button className="p-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] rounded-full">
              <Bookmark className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-[#222]">
        <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#818384]" />
            </div>
            <input
              type="text"
              placeholder="Search papers, discussions, or researchers..."
              className="block w-full pl-10 pr-3 py-2 border border-[#333] rounded-full bg-[#111] text-white focus:outline-none focus:ring-1 focus:ring-[#AD49E1] focus:border-[#AD49E1]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Trending Tags Section */}
      <div className="px-6 py-4 border-b border-[#222] overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          <div className="flex items-center text-[#AD49E1] whitespace-nowrap">
            <Flame className="w-4 h-4 mr-1" />
            <span>Trending:</span>
          </div>

          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded-full text-sm ${
              activeFilter === "all"
                ? "bg-[#AD49E1] text-white"
                : "bg-[#222] text-[#d7dadc] hover:bg-[#333]"
            }`}>
            All
          </button>

          {trendingTags.map(({ tag }, index) => (
            <button
              key={index}
              onClick={() => setActiveFilter(tag)}
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                activeFilter === tag
                  ? "bg-[#AD49E1] text-white"
                  : "bg-[#222] text-[#d7dadc] hover:bg-[#333]"
              }`}>
              <Hash className="w-3 h-3 mr-1" />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#AD49E1] border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-2xl p-6 text-red-400 text-center mb-8 backdrop-blur-sm">
            {error}
          </div>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-12 text-[#d7dadc]">
            <p>
              No posts found
              {activeFilter !== "all" ? ` for #${activeFilter}` : ""}
            </p>
          </div>
        )}

        {!loading && filteredPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                className="bg-[#111] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() =>
                  navigate(`/post/${post._id}`, {
                    state: {
                      post,
                      user: currentUser,
                      backgroundLocation: location,
                    },
                  })
                }>
                {post.imageUrl?.length > 0 ? (
                  <div className="relative aspect-square">
                    <img
                      src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[0]}`}
                      alt="Post content"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                      <div>
                        <h3 className="text-white font-medium line-clamp-1">
                          {post.title || "Research Summary"}
                        </h3>
                        <div className="flex items-center text-xs text-[#d7dadc] mt-1">
                          <span>c/{post.communityHandle || "Science"}</span>
                          <span className="mx-2">•</span>
                          <span>{post.comments?.length || 0} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-2">
                      {post.title || "Research Summary"}
                    </h3>
                    <p className="text-[#d7dadc] text-sm line-clamp-3">
                      {post.description}
                    </p>
                    <div className="flex items-center text-xs text-[#818384] mt-3">
                      <span>c/{post.communityHandle || "Science"}</span>
                      <span className="mx-2">•</span>
                      <span>{post.comments?.length || 0} comments</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;
