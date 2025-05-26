import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Menu, X } from "lucide-react"; // hamburger & close icons
const Feed = () => {
  const {  logout, isAuthenticated, user:Auth0User } = useAuth0();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
const location = useLocation();
const user = location.state?.user;
console.log(user);



  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 shadow-md">
        <button onClick={toggleSidebar} className="text-slate-800">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-2xl font-bold">FISIYO</h1>
        <div className="w-6" /> {/* spacer to balance layout */}
      </header>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-100 shadow-lg transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <ul className="space-y-2">
       
            <li>
              <button
                onClick={() => logout({ returnTo: window.location.origin })}>
                Logout
              </button>
            </li>
            {/* Add more nav items as needed */}
          </ul>
        </div>
      </div>

      {/* Overlay (click to close) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to FISIYO</h2>
        <p className="text-lg max-w-md">
          A scientific collaboration platform where innovation meets expertise.
        </p>
      
      </main>
    </div>
  );
};

export default Feed;
