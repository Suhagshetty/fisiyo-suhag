// postUtils.js
export const formatDate = (dateString) => {
  if (!dateString) return "now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
};

export const handleClose = (isModal, backgroundLocation, navigate) => {
  if (isModal && backgroundLocation) {
    navigate(backgroundLocation.pathname + backgroundLocation.search, {
      state: backgroundLocation.state,
    });
  } else {
    navigate(-1);
  }
};
 