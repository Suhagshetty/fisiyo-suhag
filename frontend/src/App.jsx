import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Feed from "./components/Feed";
import ProfileSetup from "./components/ProfileSetup";
import Profile from "./components/Profile";
import PostLoginCheck from "./components/post-login-check";
import CreatePost from "./components/CreatePost";
import CommunityCreator from "./components/communitySetup";
import PostDetail from "./components/PostDetail";
import Explore from "./components/Explore";
import CommunityPage from "./components/CommunityPage";

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
        <Route path="/community-setup" element={<CommunityCreator />} />
        <Route path="/community/:name" element={<CommunityPage />} />

        {/* Full-screen routes when accessed directly (not as modals) */}
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/compose/post" element={<CreatePost isModal={false} />} />
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
          <Route
            path="/post/:postId"
            element={
              <PostDetail
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
