import { FileText, Users } from "lucide-react";

const ProfileBanner = ({
  profileUser,
  userPosts,
  currentUser,
  isFollowing,
  isFollowLoading,
  handleFollowToggle,
}) => {
  // Don't show follow button for current user's own profile
  const showFollowButton =
    currentUser && profileUser && currentUser._id !== profileUser._id;

  return (
    <div className="relative">
      <div
        className="sm:h-64 h-30 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to top right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0) 100%), url("https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1792&q=80")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        <div className="absolute inset-0 flex sm:items-center items-center justify-start">
          <div className="container mx-auto sm:px-4 px-0 sm:pb-6 pb-0">
            <div className="flex sm:items-end items-center sm:gap-6 gap-4">
              <div className="sm:w-50 sm:h-50 w-25 h-25 rounded-full">
                {profileUser.profilePicture ? (
                  <img
                    src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${profileUser.profilePicture}`}
                    alt={profileUser.name}
                    className="w-full h-full rounded-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl flex items-center justify-center text-white text-4xl font-bold">
                    {profileUser.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Title and Info */}
              <div className="text-white flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="sm:text-5xl text-xs sm:mb-3 font-bold text-white">
                      {profileUser.name}
                    </h1>
                    <p className="sm:text-xl text-xs opacity-90 sm:mt-1 text-white">
                      n/{profileUser.handle}
                    </p>
                  </div>

                  {showFollowButton && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                      className={`px-4 py-2 rounded-full font-medium transition ${
                        isFollowLoading ? "opacity-75 cursor-not-allowed" : ""
                      } ${
                        isFollowing
                          ? "bg-white text-black hover:bg-gray-200"
                          : "bg-[#AD49E1] text-white hover:bg-[#9a3dca]"
                      }`}>
                      {isFollowLoading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isFollowing ? "Unfollowing..." : "Following..."}
                        </div>
                      ) : isFollowing ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 sm:mt-4">
                  <div className="flex items-center sm:text-base text-xs text-[#d7dadc]">
                    <FileText className="sm:h-5 sm:w-5 w-3 h-3 mr-2" />
                    <span>{userPosts.length} posts</span>
                  </div>
                  <div className="flex items-center sm:text-base text-xs text-[#d7dadc]">
                    <Users className="sm:h-5 sm:w-5 w-3 h-3 mr-2" />
                    <span>{profileUser.followersCount} followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;
