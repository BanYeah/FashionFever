"use client";

import classes from "./add-file-button.module.css";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { FileInput } from "@mantine/core";
import { ModalNoti } from "../modal/model-noti";

interface AddFileButtonProps {
  icon: string;
  size: number;
  fileRatio: string;
  setFiles: Dispatch<SetStateAction<File[]>>;
}

export function AddFileButton({
  icon,
  size,
  fileRatio,
  setFiles,
}: AddFileButtonProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>(null);

  // 이미지 비율(5:4) 및 형식(확장자) 검증
  const validateFile = (
    file: File,
  ): Promise<{ isValid: boolean; msg: React.ReactNode }> => {
    return new Promise((resolve) => {
      // 형식(확장자) 검사
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
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

      // 파일 크기 검사 (1MB 제한)
      const maxSize = 1 * 1024 * 1024; // 1MB를 바이트 단위로 계산
      if (file.size > maxSize) {
        resolve({
          isValid: false,
          msg: (
            <p>
              파일 크기가 1MB 이하인 이미지 파일만 <br />
              업로드할 수 있습니다.
            </p>
          ),
        });
        return;
      }

      // 비율 검사
      const [numerator, denominator] = fileRatio.split(":").map(Number);
      const correctRatio = numerator / denominator;

      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const ratio = img.width / img.height;
        const isCorrectRatio = Math.abs(ratio - correctRatio) < 0.01; // (오차범위 0.01 허용)

        if (!isCorrectRatio) {
          resolve({
            isValid: false,
            msg: (
              <p>
                이미지 비율이 {fileRatio}가 아닙니다. <br />
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

      <div
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <Image
          className={classes.FileInputIcon}
          src={icon}
          alt=""
          width={size}
          height={size}
        />
        <FileInput
          styles={{ root: { width: `${size}px`, height: `${size}px` } }}
          variant="unstyled"
          value={null}
          onChange={handleChange}
        />
      </div>
    </>
  );
}
