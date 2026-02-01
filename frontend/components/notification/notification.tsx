"use client";

import { useState, useContext, createContext, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { NotiIconType, ModalNoti } from "./model-noti";

interface NotificationContextType {
  notify: (message: React.ReactNode, icon?: NotiIconType) => void;
  notifyServerError: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { open, close }] = useDisclosure(false);

  const [icon, setIcon] = useState<NotiIconType>("alert");
  const [message, setMessage] = useState<React.ReactNode>(null);

  const notify = useCallback(
    (msg: React.ReactNode, i: NotiIconType = "alert") => {
      setIcon(i);
      setMessage(msg);
      open();
    },
    [open],
  );

  const notifyServerError = useCallback(() => {
    setIcon("alert");
    setMessage(
      <p>
        서버와의 통신에 실패했습니다.
        <br /> 잠시 후 다시 시도해주세요.
      </p>,
    );
    open();
  }, [open]);

  return (
    <NotificationContext.Provider value={{ notify, notifyServerError }}>
      <ModalNoti icon={icon} opened={opened} close={close}>
        {message}
      </ModalNoti>

      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification must be used within NotificationProvider");
  return context;
};
