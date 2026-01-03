import classes from './header.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { UnstyledButton } from '@mantine/core';

interface AppShellHeaderProps {
  href: string;
  gift?: boolean;
  title: string;
  subTitle?: string;
}

export default function GlobalHeader({ href, gift, title, subTitle }: AppShellHeaderProps) {
  return (
    <div className={classes.container}>
      <header className={classes.mainHeader}>
        {/* 뒤로가기 버튼 영역 */}
        <Link href={href} className={classes.backButton}>
          <Image 
            src="/images/app-shell/goback.svg" 
            alt="뒤로가기" 
            width={17} 
            height={25} 
            priority
          />
        </Link>
        
        <div className={classes.title}>{title}</div>

        {/* 우측 선물 버튼 영역 */}
        <div className={classes.rightSection}>
          {gift && (
            <UnstyledButton w={30} h={30}>
              <Image 
                src="/images/app-shell/present.svg" 
                alt="선물목록" 
                width={30} 
                height={30} 
              />
            </UnstyledButton>
          )}
        </div>
      </header>

      {subTitle && (
        <div className={classes.subHeader}>
          <p className={classes.subText}>{subTitle}</p>
        </div>
      )}
    </div>
  );

}


