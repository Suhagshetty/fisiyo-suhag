import React from "react";
import {
  Compass,
  GraduationCap,
  Home,
  Users,
  BookOpen,
  Star,
} from "lucide-react";

const SidebarNavigation = ({ navigate, currentUser }) => {
  const navigationItems = [
    {
      path: "/explore",
      icon: <Compass size={20} />,
      label: "Explore",
      state: { user: currentUser },
    },
    {
      path: "/professors",
      icon: <GraduationCap size={20} />,
      label: "Professors",
      state: { user: currentUser },
    },
    {
      path: "/community-setup",
      icon: <GraduationCap size={20} />,
      label: "New Community",
      state: { user: currentUser },
    },
    // Add more navigation items here as needed
  ];

  return (
    <div className="space-y-2 px-2">
      {navigationItems.map((item, index) => (
        <button
          key={index}
          onClick={() => navigate(item.path, { state: item.state })}
          className="flex items-center gap-4 text-[#d7dadc] hover:text-white hover:bg-[#1a1a1a] px-4 py-3 rounded-xl transition-all duration-300 w-full text-left font-medium text-sm">
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SidebarNavigation;
