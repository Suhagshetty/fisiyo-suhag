const UserProfileCard = ({ user, position }) => {
  if (!user) return null;

  return (
    <div
      className="fixed z-50 bg-[#161617] border border-[#1E1E1E] rounded-xl p-4 w-64 shadow-lg pointer-events-none"
      style={{
        top: position.top + 10,
        left: Math.max(10, Math.min(position.left, window.innerWidth - 270)),
      }}
      onMouseEnter={() => {
        setIsHoveringCard(true);
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      }}
      onMouseLeave={() => {
        setIsHoveringCard(false);
        hoverTimeoutRef.current = setTimeout(() => {
          setHoveredUser(null);
        }, 300);
      }}>
      <div className="flex flex-col items-center">
        <img
          className="w-16 h-16 rounded-full mb-3"
          src={
            user.userDp
              ? `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${user.userDp}`
              : "/default-avatar.png"
          }
          alt="avatar"
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
        <h3 className="text-white font-medium">n/{user.handle}</h3>
        <button
          onClick={() => console.log(`followed ${user.handle}`)}
          className="mt-3 w-full py-1  text-white rounded-l border border-white font-medium hover:bg-[#AD49E1]/90 transition-colors pointer-events-auto">
          Follow
        </button>
      </div>
    </div>
  );
};

export default UserProfileCard