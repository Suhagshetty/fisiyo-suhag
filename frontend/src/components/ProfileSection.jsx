// src/components/ProfileSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import NotificationSection from "./NotificationSection";

const ProfileSection = ({ isAuthenticated, currentUser }) => {
  const baseCursor = isAuthenticated ? "cursor-pointer" : "cursor-progress";
  const profileImage = currentUser?.profilePicture
    ? `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${currentUser.profilePicture}`
    : "/default-avatar.png";

  return (
    <div className="flex items-center gap-0 sm:gap-4">
      {/* Notification Section */}
      <NotificationSection
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
      />

      {/* Profile Button */}
      <Link
        to={isAuthenticated ? `/n/${currentUser?.handle}` : "#"}
        state={
          isAuthenticated
            ? { user: currentUser, handle: currentUser?.handle }
            : {}
        }>
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
