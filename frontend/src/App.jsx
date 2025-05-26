// App.jsx
import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Feed from "./components/Feed";
import ProfileSetup from "./components/ProfileSetup";
import Profile from "./components/Profile";
import PostLoginCheck from "./components/post-login-check";
import CreatePost from "./components/CreatePost";
import Explore from "./components/Explore";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/setup" element={<ProfileSetup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/post-login-check" element={<PostLoginCheck />} />
      <Route path="/create-post" element={<CreatePost />} />
      <Route path="/explore" element={<Explore />} />
    </Routes>
  );
}

export default App;
