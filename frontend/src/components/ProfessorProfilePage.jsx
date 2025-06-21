import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import PostCard from "./Post";
import axios from "axios";
import { formatDate, truncateText, formatVoteCount } from "../utils/feedUtils";
import useFeedData from "../hooks/useFeedData";

const ProfessorPage = () => {
  const { handle } = useParams();
  const { user } = useAuth0();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Feed data hooks
  const {
    expandedPosts,
    votedPosts,
    upvoteCounts,
    downvoteCounts,
    savedPosts,
    togglePostExpansion,
    handleSavePost,
    handleVote,
    setVotedPosts,
    setUpvoteCounts,
    setDownvoteCounts,
  } = useFeedData(currentUser, user);

  // Check follow status
  useEffect(() => {
    if (!currentUser) return;

    // Initialize follow status
    const following = currentUser.followers?.some(
      (id) => id.toString() === currentUser._id.toString()
    );
    setIsFollowing(following);
  }, [currentUser]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUser || isFollowLoading) return;

    setIsFollowLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    try {
      const endpoint = wasFollowing
        ? "http://localhost:3000/api/users/unfollow"
        : "http://localhost:3000/api/users/follow";

      await axios.post(endpoint, {
        followerId: user.sub, // Using Auth0 user ID
        followeeId: currentUser._id,
      });

      // Update currentUser's followers
      setCurrentUser((prev) => {
        const updatedFollowers = wasFollowing
          ? prev.followers.filter((id) => id.toString() !== user.sub)
          : [...prev.followers, user.sub];

        return {
          ...prev,
          followers: updatedFollowers,
        };
      });
    } catch (error) {
      console.error("Error toggling follow:", error);
      setIsFollowing(wasFollowing);
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Fetch professor's posts
  useEffect(() => {
    const fetchProfessorPosts = async () => {
      if (!currentUser?.posts || currentUser.posts.length === 0) {
        setUserPosts([]);
        setLoadingPosts(false);
        return;
      }

      try {
        setLoadingPosts(true);
        const idsString = currentUser.posts.join(",");
        const response = await axios.get(
          `http://localhost:3000/api/posts/by-ids?ids=${idsString}`
        );

        setUserPosts(response.data);

        // Initialize vote counts
        const initialUpvoteCounts = new Map();
        const initialDownvoteCounts = new Map();

        response.data.forEach((post) => {
          initialUpvoteCounts.set(post._id, post.upvotes?.length || 0);
          initialDownvoteCounts.set(post._id, post.downvotes?.length || 0);
        });

        setUpvoteCounts(initialUpvoteCounts);
        setDownvoteCounts(initialDownvoteCounts);
      } catch (error) {
        console.error("Error loading professor's posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    if (currentUser) fetchProfessorPosts();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4a6cf7] mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-white">
            Loading Professor Profile
          </h2>
          <p className="text-[#818384]">Retrieving academic information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e1e1e1] flex">
      <div className="flex-1 flex flex-col">
        {/* Professor Banner */}
        <div className="relative bg-gradient-to-r from-[#0d0d0d] to-[#1a1a1a] pt-16 pb-24 rounded-b-3xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-start">
              {/* Profile Image */}
              <div className="bg-[#0a0a0a] p-2 rounded-full shadow-xl">
                <img
                  src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${currentUser.profilePicture}`}
                  alt={currentUser.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#0a0a0a]"
                />
              </div>

              {/* Profile Info */}
              <div className="md:ml-8 mt-6 md:mt-0 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {currentUser.name}
                      {currentUser.institution?.designation && (
                        <span className="text-xl font-normal text-[#818384] ml-2">
                          ({currentUser.institution.designation})
                        </span>
                      )}
                    </h1>
                    <p className="text-[#b0b0b0] mt-1">@{currentUser.handle}</p>

                    {/* Institution Info */}
                    <div className="mt-4">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-400 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="font-medium">
                          {currentUser.institution?.name}
                        </span>
                        {currentUser.institution?.department && (
                          <span className="text-[#b0b0b0] ml-2">
                            • {currentUser.institution.department}
                          </span>
                        )}
                      </div>

                      {currentUser.institution?.yearsOfExperience && (
                        <div className="flex items-center mt-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-400 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            {currentUser.institution.yearsOfExperience} years of
                            experience
                          </span>
                        </div>
                      )}

                      {currentUser.institution?.email && (
                        <div className="flex items-center mt-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-400 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{currentUser.institution.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Follow Button */}
                  {user && user.sub !== currentUser.userid && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                      className={`mt-4 md:mt-0 px-6 py-2 rounded-full font-medium transition-colors ${
                        isFollowing
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-[#4a6cf7] hover:bg-[#3b5bdb]"
                      }`}>
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>

                {/* Research Interests */}
                {currentUser.interests && currentUser.interests.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Research Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-[#1e3a8a] bg-opacity-30 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Academic Stats */}
                <div className="flex mt-6 space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {currentUser.followers?.length || 0}
                    </div>
                    <div className="text-[#b0b0b0] text-sm">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {currentUser.posts?.length || 0}
                    </div>
                    <div className="text-[#b0b0b0] text-sm">Publications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {currentUser.reputation || 0}
                    </div>
                    <div className="text-[#b0b0b0] text-sm">Reputation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Publications Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
          <h2 className="text-2xl font-bold text-white mb-6">
            Recent Publications
          </h2>

          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#4a6cf7] border-t-transparent"></div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-16 bg-[#111111] rounded-xl border border-[#222]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-blue-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">
                No publications yet
              </h3>
              <p className="text-[#818384] max-w-md mx-auto">
                This professor hasn't published any academic content yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => {
                const isExpanded = expandedPosts.has(post._id);
                const userVote = votedPosts.get(post._id);
                const upvoteCount = upvoteCounts.get(post._id) || 0;
                const downvoteCount = downvoteCounts.get(post._id) || 0;

                return (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUser={currentUser}
                    isExpanded={isExpanded}
                    togglePostExpansion={togglePostExpansion}
                    userVote={userVote}
                    upvoteCount={upvoteCount}
                    downvoteCount={downvoteCount}
                    handleVote={handleVote}
                    savedPosts={savedPosts}
                    handleSavePost={handleSavePost}
                    formatDate={formatDate}
                    truncateText={truncateText}
                    formatVoteCount={formatVoteCount}
                    location={location}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessorPage;
