import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const PostLoginCheck = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const fullText = "FISIYO";
  const typingSpeed = 150;  
  const pauseDuration = 1000;  
  const eraseSpeed = 100;  
 
  useEffect(() => {
    let timer;

    if (isTyping) { 
      if (displayText.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayText(fullText.substring(0, displayText.length + 1));
        }, typingSpeed);
      } else { 
        timer = setTimeout(() => {
          setIsTyping(false);
        }, pauseDuration);
      }
    } else { 
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, eraseSpeed);
      } else { 
        setAnimationCompleted(true); 
        timer = setTimeout(() => {
          setIsTyping(true);
        }, 200);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isTyping]);
 
  useEffect(() => {
    if (!isAuthenticated || isLoading || !animationCompleted) return;

    const checkUser = async () => {
      const userId = user?.sub?.split("|")[1];
      if (!userId) {
        console.error("No userId found");
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/users/${userId}`);
        if (res.ok) {
          const userData = await res.json();
          navigate("/feed", { state: { user: userData } });
        } else if (res.status === 404) {
          navigate("/setup");
        } else {
          console.error("Unexpected server response");
        }
      } catch (err) {
        console.error("Error checking user:", err);
      }
    };

    checkUser();
  }, [isAuthenticated, isLoading, animationCompleted, user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="text-5xl font-extrabold tracking-widest">
        {displayText}
        <span
          className={`inline-block align-middle w-1 h-12 ml-1 bg-white ${
            displayText.length === fullText.length ? "animate-pulse" : ""
          }`}></span>
      </div>
    </div>
  );
};

export default PostLoginCheck;
