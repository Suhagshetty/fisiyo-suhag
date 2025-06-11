import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import {
  MessageSquare,
  Share,
  Bookmark,
  ChevronLeft,
  Edit,
  UserPlus,
  Users,
  FileText,
  Star,
} from "lucide-react";

const ProfilePage = () => {
  const { handle } = useParams();
  const { logout, user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  const [userhandle, setuserhandle] = useState(location.state?.handle || null);

  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]); // Store objects, not IDs
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (currentUser?._id) {
        try {
          console.log(currentUser._id);

          const response = await fetch(
            `http://localhost:3000/api/users/saved-posts/${currentUser._id}`
          );
          if (response.ok) {
            const saved = await response.json();
            setSavedPosts(saved); // Store full objects
            setLoading(false); // Fixed typo (removed semicolon)
          }
        } catch (error) {
          console.error("Error loading saved posts:", error);
          setLoading(false);
        }
      }
    };

    fetchSavedPosts();
  }, [currentUser]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/users/handle/${userhandle}`
        );
        console.log(response.data);

        setProfileUser(response.data);

        // Check if current user is following this profile
        // if (currentUser?._id || user?.sub) {
        //   const userId = currentUser?._id || user?.sub;
        //   const followCheck = await axios.get(
        //     `http://localhost:3000/api/users/${response.data._id}/followers/${userId}`
        //   );
        //   setIsFollowing(followCheck.data.isFollowing);
        // }

        setIsLoading(false);
      } catch (err) {
        setError("Failed to load profile");
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchUserData();
  }, [handle, currentUser, user]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const userId = currentUser?._id || user?.sub;
      if (!userId) return;

      const endpoint = isFollowing ? "unfollow" : "follow";
      await axios.post(
        `http://localhost:3000/api/users/${profileUser._id}/${endpoint}`,
        { userId }
      );

      setIsFollowing(!isFollowing);
      // Update follower count optimistically
      setProfileUser((prev) => ({
        ...prev,
        followersCount: isFollowing
          ? prev.followersCount - 1
          : prev.followersCount + 1,
      }));
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  // Render loading state
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

  // Render error state
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
        {/* Header */}
        {/* <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          <div className="max-w-screen mx-auto">
            <div className="relative mb-8">
              <div
                className="h-64 overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(to top right, #AD49E1CC 30%, transparent 60%), ${
                    profileUser.bannerUrl
                      ? `url(${profileUser.bannerUrl})`
                      : "linear-gradient(135deg, #AD49E1, #6a11cb)"
                  }`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}>
                <div className="absolute inset-0 flex items-end">
                  <div className="container mx-auto px-4 pb-6">
                    <div className="flex items-end gap-6">
                      <div className="w-40 h-40 rounded-full  ">
                        {profileUser.profilePicture ? (
                          <img
                            src={
                              `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${profileUser?.profilePicture}` ||
                              "/default-avatar.png"
                            }
                            alt={profileUser.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-r from-[#AD49E1] to-[#6a11cb] flex items-center justify-center text-white text-4xl font-bold">
                            {profileUser.name.charAt(0)}
                          </div>
                        )}
                      </div>
 
                      <div className="text-white mb-6">
                        <div className="flex items-center gap-4">
                          <h1 className="text-4xl font-bold">
                            {profileUser.name}
                          </h1>

                          {(currentUser?._id === profileUser._id ||
                            user?.sub === profileUser.userid) && (
                            <button
                              onClick={() =>
                                navigate(`/profile/edit/${profileUser.handle}`)
                              }
                              className="flex items-center gap-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] px-4 py-2 rounded-full transition-all">
                              <Edit size={16} />
                              <span>Edit Profile</span>
                            </button>
                          )}
                        </div>

                        <p className="text-xl opacity-90 mt-1">
                          u/{profileUser.handle}
                        </p>

                        <p className="mt-3 text-[#d7dadc] max-w-2xl">
                          {profileUser.bio ||
                            "This user hasn't added a bio yet."}
                        </p>

                        <div className="flex items-center gap-6 mt-4">
                          <div className="flex items-center text-[#d7dadc]">
                            <Users size={20} className="mr-2" />
                            <span className="font-medium">
                              {profileUser.followersCount || 0} followers
                            </span>
                          </div>

                          <div className="flex items-center text-[#d7dadc]">
                            <UserPlus size={20} className="mr-2" />
                            <span className="font-medium">
                              Following{" "}
                              {profileUser.followingUsers?.length || 0} users
                            </span>
                          </div>

                          <div className="flex items-center text-[#d7dadc]">
                            <FileText size={20} className="mr-2" />
                            <span className="font-medium">
                              {profileUser.posts?.length || 0} posts
                            </span>
                          </div>

                          {profileUser.reputation > 0 && (
                            <div className="flex items-center text-[#d7dadc]">
                              <Star
                                size={20}
                                className="mr-2 text-yellow-400"
                              />
                              <span className="font-medium">
                                {profileUser.reputation} reputation
                              </span>
                            </div>
                          )}
                        </div>

                        {currentUser?._id !== profileUser._id &&
                          user?.sub !== profileUser.userid && (
                            <button
                              onClick={handleFollow}
                              className={`mt-4 font-medium py-2 px-6 rounded-full transition-all duration-300 ${
                                isFollowing
                                  ? "bg-[#333] hover:bg-[#444] text-white border border-[#555]"
                                  : "bg-gradient-to-r from-[#AD49E1] to-[#6a11cb] text-white hover:from-[#c368f0] hover:to-[#7e22d3]"
                              }`}>
                              {isFollowing ? "Following" : "Follow"}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main> */}

        {/* Banner */}
        <div className="relative ">
          <div
            className="sm:h-64 h-30 overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(to top right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0) 100%), url("https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/1749337688108-jw.jpg")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}>
            <div className="absolute inset-0 flex sm:items-end items-center justify-start">
              <div className="container mx-auto sm:px-4 px-0 sm:pb-6 pb-0">
                <div className="flex sm:items-end items-center sm:gap-6 gap-4">
                  <div className="sm:w-50 sm:h-50 w-25 h-25  rounded-full">
                    {profileUser.profilePicture ? (
                      <img
                        src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${profileUser.profilePicture}`}
                        alt={profileUser.name}
                        className="w-full h-full rounded-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl flex items-center justify-center text-white text-4xl font-bold">
                        {community.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Title and Info */}
                  <div className="text-white">
                    <h1
                      className="sm:text-5xl text-xs sm:mb-3  font-bold"
                      style={{
                        color: "#ffffff",
                      }}>
                      {profileUser.name}
                    </h1>

                    <p
                      className="sm:text-xl  text-xs opacity-90 sm:mt-1"
                      style={{
                        color: "#ffffff",
                      }}>
                      {" "}
                      n/{profileUser.handle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-screen bg-[#0a0a0a] text-[#e1e1e1]">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center mb-8">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-[#1a1a1a] mr-4">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Bookmark className="text-[#AD49E1]" size={24} />
                Saved Posts
              </h1>
            </div>

            {!loading && savedPosts.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#AD49E1] border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {savedPosts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-[#111111] rounded-xl p-4 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                    onClick={() => navigate(`/post/${post._id}`)}>
                    <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                    <p className="text-[#818384] text-sm">
                      Posted in c/{post.communityHandle}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
