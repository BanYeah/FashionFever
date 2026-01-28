"use client";

import axios from "axios";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/utils/store/authStore";
import { Center, Loader } from "@mantine/core";

const PUBLIC_PATHS = ["/login", "/ranking", "/gift-list"];
const USER_PATHS = ["/enroll"];
const ADMIN_PATHS = ["/account-setting", "/theme-setting"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized, setUser, setInitialized } = useAuthStore();

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

    // 다른 유저의 /ranking/[minicode]/...에 접근하면 /home으로 리다이렉트
    if (pathname.startsWith("/ranking")) {
      // /ranking/[minicode]/... 경로에서 minicode 추출
      const match = pathname.match(/^\/ranking\/([^/]+)/);
      const minicode = match ? match[1] : null;

      if (minicode) {
        if (user.account === "judge") router.replace("/home");
        else if (user.account === "user" && user.minicode !== minicode)
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
