// Add this to your Feed.js file
import {
  Compass,
  GraduationCap,
  SquarePlus,
  Home,
  Users,
  BookOpen,
  Star,
} from "lucide-react";

const MobileNavBar = ({ navigate, currentUser }) => {
  const navItems = [
    {
      path: "/explore",
      icon: <Compass size={24} />,
      label: "Explore",
      state: { user: currentUser },
    },
    {
      path: "/community-setup",
      icon: <SquarePlus size={24} />,
      label: "New Community",
      state: { user: currentUser },
    },
    {
      path: "/professors",
      icon: <GraduationCap size={24} />,
      label: "Professors",
      state: { user: currentUser },
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-3xl bg-black/40  flex justify-around  z-30 sm:hidden">
      {navItems.map((item, index) => (
        <button
          key={index}
          onClick={() => navigate(item.path, { state: item.state })}
          className="flex flex-col items-center justify-center text-[#d7dadc] hover:text-white transition-colors"
          aria-label={item.label}>
          <div className="p-2">{item.icon}</div>
        </button>
      ))}
    </div>
  );
};


export default MobileNavBar