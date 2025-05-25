import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Feed = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  console.log(user);
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-800 font-sans px-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to FISIYO</h1>
      <p className="text-lg mb-8 text-center max-w-md">
        A scientific collaboration platform where innovation meets expertise.
      </p>
    </div>
  );
};

export default Feed;
