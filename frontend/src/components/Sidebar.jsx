import React from "react";
import { X, LogOut } from "lucide-react";
import SidebarNavigation from "./SidebarNavigation";
import CommunityList from "./CommunityList";

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  isAuthenticated,
  logout,
  navigate,
  currentUser,
  communities,
}) => {
  return (
    <nav
      className={`w-[300px] bg-[#111111] flex flex-col transition-all duration-300 z-30
        lg:block lg:relative lg:translate-x-0
        ${
          isSidebarOpen
            ? "fixed inset-y-0 left-0 translate-x-0 shadow-2xl"
            : "fixed inset-y-0 left-0 -translate-x-full"
        }
        lg:transform-none lg:shadow-none`}
      style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
      {/* Sidebar Header - Fixed */}
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h1
            className="text-2xl font-bold text-white flex items-center gap-2"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            FISIYO
          </h1>
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Menu - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#AD49E1]/60 scrollbar-track-[#1a1a1a]/80">
        <SidebarNavigation navigate={navigate} currentUser={currentUser} />

        {/* Communities Section */}
        <div className="px-2 mt-1">
          <div className="space-y-1.5">
            {communities.length > 0 && (
              <CommunityList
                communities={communities}
                currentUser={currentUser}
              />
            )}
          </div>
        </div>
      </div>

      {/* User Section - Fixed at bottom */}
      {isAuthenticated && (
        <div className="px-6 pb-6 flex-shrink-0">
          <button
            onClick={() => logout({ returnTo: window.location.origin })}
            className="flex items-center gap-4 text-[#d7dadc] hover:text-red-400 hover:bg-[#1a1a1a] w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;
