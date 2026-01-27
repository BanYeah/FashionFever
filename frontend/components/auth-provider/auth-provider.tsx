"use client";

import axios from "axios";
import { useEffect } from "react";
import { useAuthStore } from "@/utils/store/authStore";
import { Center, Loader } from "@mantine/core";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized, setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized) return;

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
  }, [isInitialized, setUser, setInitialized]);

  if (!isInitialized)
    return (
      <Center w={"100%"} mih={"100dvh"}>
        <Loader color="var(--main)" />
      </Center>
    );

  return <>{children}</>;
}
