"use client";

import axios from "axios";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/utils/store/authStore";
import { Center, Loader } from "@mantine/core";

import api from "@/utils/api";

const PUBLIC_PATHS = ["/login", "/ranking", "/gift-list"];
const USER_PATHS = ["/enroll"];
const ADMIN_PATHS = ["/account-setting", "/theme-setting"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized, setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { status } = error.response || {};

        // UnauthorizedException
        if (status === 401) {
          setUser(null);
          setInitialized(true);

          if (pathname !== "/login") router.push("/login");
        }
        // ForbiddenException
        else if (status === 403) {
          try {
            const res = await axios.get(
              `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/status`,
              {
                withCredentials: true,
              },
            );
            setUser(res.data);
          } catch (e) {
            setUser(null);
          } finally {
            setInitialized(true);
            router.push("/home");
          }
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [router, pathname, setUser, setInitialized]);

  useEffect(() => {
    if (!isInitialized) {
      (async () => {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/status`,
            {
              withCredentials: true,
            },
          );
          setUser(res.data);
        } catch (error) {
          setUser(null);
        } finally {
          setInitialized(true);
        }
      })();
      return;
    }

    if (!user) {
      // 로그인이 안 된 상태에서는 PUBLIC_PATHS만 접근 가능
      if (!PUBLIC_PATHS.includes(pathname)) router.replace("/login");
      return;
    }

    // 로그인이 된 상태에서 /login은 /home으로 리다이렉트
    if (pathname === "/login") router.replace("/home");

    // 유저가 아닌데 USER_PATHS에 접근하면 /home으로 리다이렉트
    if (user.account !== "user" && USER_PATHS.includes(pathname))
      router.replace("/home");

    // 관리자가 아닌데 ADMIN_PATHS에 접근하면 /home으로 리다이렉트
    if (user.account !== "admin" && ADMIN_PATHS.includes(pathname))
      router.replace("/home");

    // 다른 유저의 /ranking/[user_id]/...에 접근하면 /home으로 리다이렉트
    if (pathname.startsWith("/ranking")) {
      // /ranking/[user_id]/... 경로에서 user_id 추출
      const match = pathname.match(/^\/ranking\/([^/]+)/);
      const user_id = match ? match[1] : null;

      if (user_id) {
        if (
          (user.account === "user" && user.user_id !== user_id) ||
          user.account === "judge"
        )
          router.replace("/home");
      }
    }
  }, [router, pathname, user, isInitialized, setUser, setInitialized]);

  if (!isInitialized && !PUBLIC_PATHS.includes(pathname))
    return (
      <Center mih={"100dvh"}>
        <Loader type="dots" color="var(--main)" />
      </Center>
    );

  return <>{children}</>;
}
