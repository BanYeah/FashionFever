import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  withCredentials: true,
});

// Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { status } = error.response || {};
    const { setUser, setInitialized } = useAuthStore.getState();

    if (status === 401) {
      // UnauthorizedException
      setUser(null);
      setInitialized(true);

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      )
        window.location.href = "/login";
    } else if (status === 403) {
      // ForbiddenException
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/status`,
          {
            withCredentials: true,
          },
        );

        setUser(res.data);
        setInitialized(true);
      } catch (e) {
        setUser(null);
        setInitialized(true);
      } finally {
        window.location.href = "/home";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
