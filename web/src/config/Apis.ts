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
  },
  rooms: {
    getRooms: "/rooms",
  },
  locations: {
    getLocations: "/locations",
  },
  roomMembers: {
    getRoomMembers: "/room-members",
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
