import axios, { type AxiosInstance } from "axios";
import Cookies from "js-cookie";

const BASE_URL = "http://localhost:8080/api/v1";

export const endPoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  users: {
    getMe: "/users/me",
    getUserProfileByUserId: "/users/{id}/profile",
  },
  categories: {
    getCategories: "/categories",
  },
  rooms: {
    getRooms: "/rooms",
    searchRooms: "/rooms/search",
    getMyPrivateRooms: "/rooms/private",
    createEventRoom: "/rooms/create-event-room",
    createPrivateRoom: "/rooms/create-private-room",
    checkPasswordRoom: (id: string) => `/rooms/${id}/check-password`,
    getRoomById: (id: string) => `/rooms/${id}`,
    closeRoom: (id: string) => `/rooms/${id}/close`,
    openRoom: (id: string) => `/rooms/${id}/open`,
    readyRoom: (id: string) => `/rooms/${id}/ready`,
    unreadyRoom: (id: string) => `/rooms/${id}/unready`,
  },
  locations: {
    getLocations: "/locations",
    createLocation: "/locations",
  },
  roomMembers: {
    getRoomMembers: "/room-members",
    getRoomById: (id: string) => `/room-members/${id}`,
    getRoomMemberByRoomId: "/room-members",
    joinRoom: "/room-members",
    outRoom: "/room-members/out",
    getRoomMemberByEventRoom: "/room-members/event",
  },
  friendRequests: {
    getFriendRequests: "/friend-requests",
    sendFriendRequest: "/friend-requests",
    acceptFriendRequest: (id: string) => `/friend-requests/${id}/accept`,
    declineFriendRequest: (id: string) => `/friend-requests/${id}/decline`,
    checkIfFriendRequest: "/friend-requests/check",
  },
  friends: {
    getFriendByUserId: "/friends",
    checkIfFriend: "/friends/check",
    createFriend: "/friends/create",
  },
  notifications: {
    getNotifications: "/notifications",
    getMyNotifications: "/notifications/me",
    createNotification: "/notifications",
    markAsRead: (id: string) => `/notifications/${id}/read`,
    deleteNotification: (id: string) => `/notifications/${id}`,
  },
  messages: {
    getMessagesByRoomId: "/messages",
    sendMessage: "/messages",
  },
} as const;

export const authApis = (): AxiosInstance => {
  const token = Cookies.get("token");

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    withCredentials: true,
  });
};

export default axios.create({
  baseURL: BASE_URL,
});
