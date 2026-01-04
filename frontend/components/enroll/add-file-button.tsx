"use client";

import classes from "./add-file-button.module.css";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { FileInput } from "@mantine/core";
import { ModalNoti } from "../modal/model-noti";

interface AddFileButtonProps {
  setFiles: Dispatch<SetStateAction<File[]>>;
}

export function AddFileButton({ setFiles }: AddFileButtonProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>(null);

  // 이미지 비율(5:4) 및 형식(확장자) 검증
  const validateFile = (
    file: File
  ): Promise<{ isValid: boolean; msg: React.ReactNode }> => {
    return new Promise((resolve) => {
      // 형식(확장자) 검사
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        resolve({
          isValid: false,
          msg: (
            <p>
              JPG 또는 PNG 형식의 이미지 파일만 <br />
              업로드할 수 있습니다.
            </p>
          ),
        });
        return;
      }

      // 비율(5:4) 검사
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const ratio = img.width / img.height;
        const isCorrectRatio = Math.abs(ratio - 1.25) < 0.01; // (오차범위 0.01 허용)

        if (!isCorrectRatio) {
          resolve({
            isValid: false,
            msg: (
              <p>
                이미지 비율이 5:4가 아닙니다. <br />
                규격에 맞는 이미지를 선택해 주세요.
              </p>
            ),
          });
        } else {
          resolve({ isValid: true, msg: <></> });
        }
      };
      img.onerror = () =>
        resolve({
          isValid: false,
          msg: <p>이미지 파일을 읽는 중 오류가 발생했습니다.</p>,
        });
    });
  };

  const handleChange = async (file: File | null) => {
    if (!file) return;

    const result = await validateFile(file);

    if (!result.isValid) {
      setErrorMessage(result.msg);
      open();
      return;
    }

    setFiles((prev) => {
      if (prev.length >= 4) {
        setErrorMessage(<p>이미지는 최대 4장까지 등록 가능합니다.</p>);
        open();
        return prev;
      }
      return [...prev, file];
    });
  };

  return (
    <>
      <ModalNoti icon="alert" opened={opened} close={close}>
        {errorMessage}
      </ModalNoti>

      <div className={classes.FileInputContainer}>
        <div className={classes.FileInputWrapper}>
          <Image
            className={classes.FileInputIcon}
            src="/images/enroll/add-file.svg"
            alt=""
            width={40}
            height={40}
          />
          <FileInput
            classNames={{ root: classes.FileInput }}
            variant="unstyled"
            value={null}
            onChange={handleChange}
          />
        </div>
      </div>
    </>
  );
}
