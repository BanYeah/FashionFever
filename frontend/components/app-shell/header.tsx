// src/components/app-shell/header.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './header.module.css';
import { UnstyledButton } from '@mantine/core';

interface GlobalHeaderProps {
  href: string;
  gift?: boolean;
  description: string;
  subDescription?: string;
}

export default function GlobalHeader({ href, gift, description, subDescription }: GlobalHeaderProps) {
  return (
    <div className={styles.container}>
      <header className={styles.mainHeader}>
        {/* 뒤로가기 버튼 영역 */}
        <Link href={href} className={styles.backButton}>
          <Image 
            src="/images/app-shell/goback.svg" // /public 제거, images 확인
            alt="뒤로가기" 
            width={17} // 요청하신 사이즈 43
            height={25} // 요청하신 사이즈 38
            priority
          />
        </Link>
        
        <div className={styles.title}>{description}</div>

        {/* 우측 선물 버튼 영역 */}
        <div className={styles.rightSection}>
          {gift && (
            <UnstyledButton w={30} h={30}>
              <Image 
                src="/images/app-shell/present.svg" // /public 제거, images 확인
                alt="선물목록" 
                width={30} 
                height={30} 
              />
            </UnstyledButton>
          )}
        </div>
      </header>

      {subDescription && (
        <div className={styles.subHeader}>
          <p className={styles.subText}>{subDescription}</p>
        </div>
      )}
    </div>
  );
}