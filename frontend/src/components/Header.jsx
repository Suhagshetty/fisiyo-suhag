// Create a new Header.jsx file
import React from "react";
import { Link } from "react-router-dom";
import { Menu, Search, Bell } from "lucide-react";

const Header = ({ toggleSidebar, isAuthenticated, currentUser }) => {
  return (
    <header className="bg-[#111111]/80 backdrop-blur-xl z-40 flex-shrink-0">
      <div className="max-w-7xl mx-auto sm:px-6 px-2 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-[#d7dadc] hover:text-white lg:hidden">
            <Menu size={24} />
          </button>
        </div>

        {/* Search bar */}
        <div className="flex-1 sm:max-w-2xl max-w-3xl ml-3 sm:mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-[#818384]" />
            </div>
            <input
              type="text"
              placeholder="Search Fisiyo"
              className="w-full pl-12 pr-6 py-2.5 bg-[#1a1a1a] rounded-full focus:ring-2 focus:ring-[#AD49E1] focus:bg-[#222222] transition-all duration-300 text-sm text-white placeholder-[#818384] shadow-inner"
            />
          </div>
        </div>

        {isAuthenticated && (
          <Link
            to={`/n/${currentUser.handle}`}
            state={{ user: currentUser, handle: currentUser.handle }}>
            <div className="flex items-center gap-0 sm:gap-4">
              <button className="text-[#818384] hover:text-white sm:p-3 px-1 rounded-full hover:bg-[#1a1a1a] transition-all duration-300">
                <Bell size={20} />
              </button>
              <div className="cursor-pointer hover:bg-[#1a1a1a] px-2 sm:px-3 py-2 rounded-xl transition-all duration-300">
                <img
                  src={
                    `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${currentUser?.profilePicture}` ||
                    "/default-avatar.png"
                  }
                  alt="Profile"
                  className="sm:w-9 sm:h-9 w-7 h-7 rounded-full object-cover"
                />
              </div>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
