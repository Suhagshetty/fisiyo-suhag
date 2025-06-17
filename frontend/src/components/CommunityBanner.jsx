// src/components/CommunityBanner.js
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const CommunityBanner = ({
  community,
  isMember,
  onJoin,
  onLeave,
  isLoading,
}) => {
  const { user, isAuthenticated } = useAuth0();
  if (!community) return null;

  return (
    <div className="relative">
      <div
        className="sm:h-64 h-30 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(
            to top right,
            ${community.colorPrimary || "#AD49E1"}CC 0%,     
            ${community.colorPrimary || "#AD49E1"}99 30%,   
            ${community.colorPrimary || "#AD49E1"}66 60%,   
            transparent 100%                                   
          ), url(${
            community.bannerUrl ||
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1792&q=80"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        <div className="absolute inset-0 flex sm:items-end items-start justify-start">
          <div className="container mx-auto sm:px-4 px-0 sm:pb-6 pb-0">
            <div className="flex sm:items-end items-center sm:gap-6 gap-4">
              <div className="sm:w-68 sm:h-50 w-35 h-28 rounded-full overflow-visible">
                {community.avatarUrl ? (
                  <img
                    src={community.avatarUrl}
                    alt={community.title}
                    className="w-full h-full object-contain"
                    style={{
                      filter: "drop-shadow(5px 30px 10px rgba(0, 0, 0, 0.1))",
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-white text-4xl font-bold bg-gray-600"
                    style={{
                      filter: "drop-shadow(0 20px 15px rgba(0, 0, 0, 0.4))",
                      transform: "translateY(-10px)",
                    }}>
                    {community.title.charAt(0)}
                  </div>
                )}
              </div>

              <div className="text-white">
                <h1
                  className="sm:text-5xl text-xs sm:mb-3  font-bold"
                  style={{
                    color: community.colorSecondary || "#ffffff",
                  }}>
                  {community.title}
                </h1>

                <p
                  className="sm:text-xl  text-xs opacity-90 sm:mt-1"
                  style={{
                    color: community.colorSecondary || "#ffffff",
                  }}>
                  c/{community.name}
                </p>
                <p
                  className="sm:mt-3  sm:text-base  text-xs text-[#d7dadc] max-w-2xl"
                  style={{
                    color: community.colorSecondary || "#ffffff",
                  }}>
                  {community.description}
                </p>

                <div className="flex items-center gap-6 sm:mt-4 ">
                  <div
                    className="flex items-center sm:text-base  text-xs text-[#d7dadc]"
                    style={{
                      color: community.colorSecondary || "#ffffff",
                    }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="sm:h-5 sm:w-5 w-3 h-3 mr-2 "
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">
                      {community.memberCount.toLocaleString()} members
                    </span>
                  </div>

                  <div
                    className="flex items-center text-[#d7dadc]"
                    style={{
                      color: community.colorSecondary || "#ffffff",
                    }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="sm:h-5 sm:w-5 w-3 h-3 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium sm:text-base  text-xs">
                      {community.postCount.toLocaleString()} research posts
                    </span>
                  </div>
                  {isAuthenticated && (
                    <button
                      onClick={isMember ? onLeave : onJoin}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        isMember
                          ? "bg-gray-800 hover:bg-gray-700 text-white"
                          : "bg-[#AD49E1] hover:bg-[#8a36b3] text-white"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          {isMember ? "Leaving..." : "Joining..."}
                        </span>
                      ) : isMember ? (
                        "Leave"
                      ) : (
                        "Join"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityBanner;
