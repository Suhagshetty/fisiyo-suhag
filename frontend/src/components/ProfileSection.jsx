// src/components/ProfileSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import NotificationSection from "./NotificationSection";

const ProfileSection = ({ isAuthenticated, currentUser }) => {
  const baseCursor = isAuthenticated ? "cursor-pointer" : "cursor-progress";
  const profileImage = currentUser?.profilePicture
    ? `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${currentUser.profilePicture}`
    : "/default-avatar.png";

  // Determine profile link based on user role
  const getProfileLink = () => {
    if (!isAuthenticated) return "#";

    return currentUser?.role === "explorer"
      ? `/n/${currentUser?.handle}`
      : `/professor/${currentUser?.handle}`;
  };

  // Prepare state data for route
  const routeState = isAuthenticated
    ? { user: currentUser, handle: currentUser?.handle }
    : {};

  return (
    <div className="flex items-center gap-0 sm:gap-4">
      <NotificationSection
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
      />

      <Link to={getProfileLink()} state={routeState}>
        <div
          className={`hover:bg-[#1a1a1a] px-2 sm:px-3 py-2 rounded-xl transition-all duration-300 ${baseCursor}`}>
          <img
            src={profileImage}
            alt="Profile"
            className="sm:w-9 sm:h-9 w-7 h-7 rounded-full object-cover"
          />
        </div>
      </Link>
    </div>
  );
};

export default ProfileSection;
