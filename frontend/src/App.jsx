import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Feed from "./components/Feed";
import ProfileSetup from "./components/ProfileSetup";
import Profile from "./components/Profile";
import PostLoginCheck from "./components/post-login-check";
import CreatePost from "./components/CreatePost";
import Explore from "./components/Explore";

function App() {
  const location = useLocation();

  // Check if we're showing a modal route
  const isModal = location.state?.backgroundLocation;
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <div>
      {/* Main routes - if modal is open, render the background location */}
      <Routes location={isModal ? backgroundLocation : location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/setup" element={<ProfileSetup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post-login-check" element={<PostLoginCheck />} />
        <Route path="/explore" element={<Explore />} />
        {/* Full-screen CreatePost when accessed directly */}
        {!isModal && (
          <Route
            path="/compose/post"
            element={<CreatePost isModal={false} />}
          />
        )}
      </Routes>

      {/* Modal routes - only render when modal state is present */}
      {isModal && (
        <Routes>
          <Route
            path="/compose/post"
            element={
              <CreatePost
                isModal={true}
                backgroundLocation={backgroundLocation}
              />
            }
          />
        </Routes>
      )}
    </div>
  );
}

export default App;
