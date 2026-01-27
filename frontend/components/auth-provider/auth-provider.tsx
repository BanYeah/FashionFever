"use client";

import axios from "axios";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/utils/store/authStore";
import { Center, Loader } from "@mantine/core";

const PUBLIC_PATHS = ["/login", "/ranking", "/gift-list"];

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
    }

    if (!user && !PUBLIC_PATHS.includes(pathname)) router.replace("/login");
    else if (user && pathname === "/login") router.replace("/home");
  }, [router, pathname, user, isInitialized, setUser, setInitialized]);

  if (!isInitialized && !PUBLIC_PATHS.includes(pathname))
    return (
      <Center w={"100%"} mih={"100dvh"}>
        <Loader color="var(--main)" />
      </Center>
    );

  return <>{children}</>;
}
