import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import CreatePost from "./CreatePost";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Flame,
  Compass,
  Globe,
  UserPlus,
  LogOut,
  Lightbulb,
  Users,
  MessageCircle,
  Microscope,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

const Feed = () => {
  const { logout, user, isAuthenticated } = useAuth0();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to false for mobile
  const [showCreatePost, setShowCreatePost] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  console.log(currentUser);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex">
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onSubmit={async (postData) => {
            // Handle post submission here
            console.log("New post:", postData);
            // You would typically send this to your backend
          }}
        />
      )}

      {/* Vertical Sidebar - Always visible on desktop (lg+), toggleable on mobile */}
      <nav
        className={`
        w-64 bg-white border-r border-gray-200 flex flex-col p-6 space-y-8 transition-all duration-300 z-30
        lg:block lg:relative lg:translate-x-0
        ${
          isSidebarOpen
            ? "fixed inset-y-0 left-0 translate-x-0"
            : "fixed inset-y-0 left-0 -translate-x-full"
        }
        lg:transform-none
      `}>
        <div className="flex items-center justify-between mb-8">
          <span
            className="text-2xl font-light tracking-wide text-black"
            style={{ fontFamily: "Playfair Display, serif" }}>
            FISIYO
          </span>
          {/* Only show close button on mobile */}
          <button onClick={toggleSidebar} className="text-black lg:hidden">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <a
            href="#"
            className="flex items-center gap-3 text-black hover:text-gray-600 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <Home size={18} strokeWidth={1.5} /> <span>Home</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 text-black hover:text-gray-600 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <Flame size={18} strokeWidth={1.5} /> <span>Popular</span>
          </a>
          <a
            onClick={() =>
              navigate("/explore", { state: { user: currentUser } })
            }
            className="flex items-center gap-3 text-black hover:text-gray-600 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <Compass size={18} strokeWidth={1.5} /> <span>Explore</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 text-black hover:text-gray-600 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <Globe size={18} strokeWidth={1.5} /> <span>All Topics</span>
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowCreatePost(true);
            }}
            className="flex items-center gap-3 text-black hover:text-gray-600 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <UserPlus size={18} strokeWidth={1.5} /> <span>Create Post</span>
          </a>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-light text-gray-600 mb-4 tracking-wider">
            RESEARCH TOOLS
          </h3>
          <div className="flex flex-col space-y-2">
            <a
              href="#"
              className="flex items-center gap-3 text-black hover:text-gray-600 p-3 rounded-lg hover:bg-gray-100 transition-colors">
              <Lightbulb size={18} strokeWidth={1.5} />{" "}
              <span>Hypothesis Lab</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 text-black hover:text-gray-600 p-3 rounded-lg hover:bg-gray-100 transition-colors">
              <Users size={18} strokeWidth={1.5} /> <span>Collaborate</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 text-black hover:text-gray-600 p-3 rounded-lg hover:bg-gray-100 transition-colors">
              <MessageCircle size={18} strokeWidth={1.5} />{" "}
              <span>Discussions</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 text-black hover:text-gray-600 p-3 rounded-lg hover:bg-gray-100 transition-colors">
              <Microscope size={18} strokeWidth={1.5} />{" "}
              <span>Methodologies</span>
            </a>
          </div>
        </div>

        {isAuthenticated && (
          <div className="mt-auto pt-8">
            <div className="flex items-center justify-center gap-3 p-3 mb-4 rounded-lg bg-gray-100">
              <span className="text-black font-light">{user?.name}</span>
            </div>
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="flex items-center gap-3 text-red-600 hover:text-red-500 w-full p-3 rounded-lg hover:bg-gray-100 transition-colors font-light">
              <LogOut size={18} strokeWidth={1.5} /> <span>Logout</span>
            </button>
          </div>
        )}
      </nav>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-40">
          {/* Only show menu button on mobile */}
          <button
            onClick={toggleSidebar}
            className="text-black lg:hidden"
            style={{ fontFamily: "Manrope, sans-serif" }}>
            <Menu size={24} />
          </button>

          {/* On desktop, show a placeholder or logo when there's no toggle button */}
          <div className="hidden lg:block">
            <span
              className="text-xl font-light tracking-wide text-black"
              style={{ fontFamily: "Playfair Display, serif" }}>
              Feed
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <div
                className="flex items-center cursor-pointer"
                onClick={() =>
                  navigate("/profile", { state: { user: currentUser } })
                }>
                {/* Always show profile picture on desktop, adapt for mobile */}
                <img
                  src={user?.picture || "/default-avatar.png"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover lg:block"
                />
                {/* Show username on mobile when sidebar is closed */}
                <span
                  className="text-black font-light ml-2 lg:hidden"
                  style={{ fontFamily: "Manrope, sans-serif" }}>
                  {!isSidebarOpen && user?.name}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Main Feed */}
        <main className="p-6 overflow-y-auto flex-1 bg-white">
          {/* Example Post */}
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
              <div>
                <h3 className="text-black font-medium">Username</h3>
                <p className="text-gray-600 text-sm">Posted 2 hours ago</p>
              </div>
            </div>
            <h2 className="text-xl text-black font-light mb-3">
              Research Paper Title
            </h2>
            <p className="text-gray-700 mb-4">
              This is a summary of the research findings. The study examined the
              effects of...
            </p>
            <div className="flex space-x-4 text-gray-600">
              <button className="hover:text-black">Like</button>
              <button className="hover:text-black">Comment</button>
              <button className="hover:text-black">Share</button>
            </div>
          </div>

          {/* Second Example Post */}
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
              <div>
                <h3 className="text-black font-medium">Another User</h3>
                <p className="text-gray-600 text-sm">Posted 5 hours ago</p>
              </div>
            </div>
            <h2 className="text-xl text-black font-light mb-3">
              New Methodology Approach
            </h2>
            <p className="text-gray-700 mb-4">
              Discovered a novel approach to analyzing data that reduces
              computation time by 40%...
            </p>
            <div className="flex space-x-4 text-gray-600">
              <button className="hover:text-black">Like</button>
              <button className="hover:text-black">Comment</button>
              <button className="hover:text-black">Share</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Feed;
