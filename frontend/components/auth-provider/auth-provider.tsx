"use client";

import axios from "axios";
import { useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/utils/store/authStore";
import { Center, Loader } from "@mantine/core";
import {
  PUBLIC_PATHS,
  PRIVATE_PATHS,
  USER_PATHS,
  JUDGE_PATHS,
  ADMIN_PATHS,
} from "@/types/paths";

import NotFoundPage from "@/app/not-found";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized, setUser, setInitialized } = useAuthStore();

  const refreshAuth = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/status`,
        { withCredentials: true },
      );
      setUser(res.data);
    } catch (e) {
      setUser(null);
    } finally {
      setInitialized(true);
    }
  }, [setUser, setInitialized]);

  useEffect(() => {
    if (!isInitialized) refreshAuth();
  }, [isInitialized, refreshAuth]);

  const matchPath = (
    target: string,
    source: string,
    userId?: string | null,
  ) => {
    // [id] 같은 동적 세그먼트가 없는 경우, 완전 일치 확인
    if (!target.includes("[")) return target === source;

    // [id] 같은 동적 세그먼트 부분을 ([^/]+) 캡처 그룹으로 변환
    const pattern = target.replace(/\//g, "\\/").replace(/\[.*?\]/g, "([^/]+)");

    const regex = new RegExp(`^${pattern}$`);
    const match = source.match(regex);

    // 경로 자체가 일치하지 않는 경우
    if (!match) return false;

    // 경로가 일치하고, 추출된 id값이 있다면 인자로 받은 userId와 비교
    if (userId && match[1]) return match[1] === userId;

    return true;
  };

  const getAllowedPath = (account: "user" | "judge" | "admin") => {
    switch (account) {
      case "user":
        return [...PRIVATE_PATHS, ...USER_PATHS];
      case "judge":
        return [...PRIVATE_PATHS, ...JUDGE_PATHS];
      case "admin":
        return [...PRIVATE_PATHS, ...ADMIN_PATHS];
    }
  };

  // 리다이렉트
  useEffect(() => {
    if (!isInitialized) return;

    // 비로그인 상태인데 공개된 페이지 (Public Path)가 아닌 경우
    if (!user && !PUBLIC_PATHS.some((path) => matchPath(path, pathname))) {
      router.replace("/login");
      return;
    }
  }, [router, pathname, user, isInitialized]);

  /* 공개된 페이지 (Public Path) */
  if (PUBLIC_PATHS.some((path) => matchPath(path, pathname)))
    return <>{children}</>;

  /* 보호된 페이지 (Private Path) */
  if (!isInitialized) {
    return (
      <Center mih={"100dvh"}>
        <Loader type="dots" color="var(--main)" />
      </Center>
    );
  }

  // 인증 없음
  if (!user) return null;

  // 권한 없음
  const allowedPaths = getAllowedPath(user.account);
  if (!allowedPaths.some((path) => matchPath(path, pathname, user.user_id)))
    return <NotFoundPage />;

  return <>{children}</>;
}
