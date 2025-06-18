import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import PostCard from "./Post";
import ProfileBanner from "./ProfileBanner";
import axios from "axios";
import { formatDate, truncateText, formatVoteCount } from "../utils/feedUtils";
import useFeedData from "../hooks/useFeedData"; 

const ProfilePage = () => {
  const { handle } = useParams();
  const { user } = useAuth0();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  const [userhandle, setuserhandle] = useState(location.state?.handle || null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

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

  // Check follow status when profileUser changes
  useEffect(() => {
    const checkFollowStatus = () => {
      if (!currentUser || !profileUser) return;

      // Check if currentUser is following profileUser
      const following = currentUser.followingUsers?.some(
        (id) => id.toString() === profileUser._id.toString()
      );
      setIsFollowing(following);
    };

    checkFollowStatus();
  }, [profileUser, currentUser]);

  // Handle follow/unfollow toggle
  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser || isFollowLoading) return;

    setIsFollowLoading(true);
    const wasFollowing = isFollowing;
    const oldFollowersCount = profileUser.followersCount;

    // Optimistic UI update
    setIsFollowing(!wasFollowing);
    setProfileUser((prev) => ({
      ...prev,
      followersCount: wasFollowing
        ? prev.followersCount - 1
        : prev.followersCount + 1,
    }));

    try {
      const endpoint = wasFollowing
        ? "http://localhost:3000/api/users/unfollow"
        : "http://localhost:3000/api/users/follow";

      await axios.post(endpoint, {
        followerId: currentUser._id,
        followeeId: profileUser._id,
      });

      // Update currentUser's followingUsers
      if (currentUser.followingUsers) {
        const updatedFollowing = wasFollowing
          ? currentUser.followingUsers.filter(
              (id) => id.toString() !== profileUser._id.toString()
            )
          : [...currentUser.followingUsers, profileUser._id];

        setCurrentUser((prev) => ({
          ...prev,
          followingUsers: updatedFollowing,
        }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      // Revert on error
      setIsFollowing(wasFollowing);
      setProfileUser((prev) => ({
        ...prev,
        followersCount: oldFollowersCount,
      }));
    } finally {
      setIsFollowLoading(false);
    }
  };


  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/users/handle/${userhandle}`
        );
        setProfileUser(response.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load profile");
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchUserData();
  }, [handle, currentUser, user]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (
        !profileUser?._id ||
        !profileUser?.posts ||
        profileUser.posts.length === 0
      ) {
        setUserPosts([]);
        setLoadingPosts(false);
        return;
      }

      try {
        setLoadingPosts(true);
        const idsString = profileUser.posts.join(",");
        const response = await axios.get(
          `http://localhost:3000/api/posts/by-ids?ids=${idsString}`
        );

        setUserPosts(response.data);

        const initialUpvoteCounts = new Map();
        const initialDownvoteCounts = new Map();

        response.data.forEach((post) => {
          initialUpvoteCounts.set(post._id, post.upvotes?.length || 0);
          initialDownvoteCounts.set(post._id, post.downvotes?.length || 0);
        });

        setUpvoteCounts(initialUpvoteCounts);
        setDownvoteCounts(initialDownvoteCounts);
      } catch (error) {
        console.error("Error loading user posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    if (profileUser) fetchUserPosts();
  }, [profileUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#AD49E1] mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-white">
            Loading Profile Data
          </h2>
          <p className="text-[#818384]">Analyzing user information...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="bg-[#111111] p-8 rounded-3xl max-w-md w-full shadow-2xl border border-[#272b30]">
          <div className="text-center">
            <div className="bg-red-500/20 p-4 rounded-full inline-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mt-4">
              Profile Not Found
            </h2>
            <p className="text-[#818384] mt-2">
              The user <span className="font-mono">u/{handle}</span> could not
              be located in our database.
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] text-white font-medium py-2 px-6 rounded-full transition-all duration-300">
              Return to Previous Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e1e1e1] flex">
      <div className="flex-1 flex flex-col">
        {/* Banner */}

        <ProfileBanner
          profileUser={profileUser}
          userPosts={userPosts}
          currentUser={currentUser}
          isFollowing={isFollowing}
          isFollowLoading={isFollowLoading}
          handleFollowToggle={handleFollowToggle}
        />

        {/* Posts Section */}
        <div className="max-w-4xl mx-auto px-4 pb-8 w-full">
          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#AD49E1] border-t-transparent"></div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-16">
            
              <h3 className="text-2xl font-semibold text-white mb-3">
                No posts yet
              </h3>
            </div>
          ) : (
            <div className="space-y-0 sm:border overflow-hidden border-[#222]">
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

export default ProfilePage;
