// src/api/communityApi.js
import axios from "axios";

export const joinCommunity = async (communityId, accessToken) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/communities/${communityId}/join`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Add header
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to join community";
  }
};

export const leaveCommunity = async (communityId, accessToken) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/communities/${communityId}/leave`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Add header
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to leave community";
  }
};
