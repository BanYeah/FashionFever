// src/components/rating/HeartRating.tsx
import { Rating } from '@mantine/core';
import Image from 'next/image';
import styles from './heartrating.module.css';

interface HeartRatingProps {
  value: number; // 0.0 ~ 5.0 사이의 정밀한 값
  width: number;
  height: number;
}

export default function HeartRating({ value, width, height }: HeartRatingProps) {
  // 💡 Clamp 로직: 0 미만은 0으로, 5 초과는 5로 고정
  const clampedValue = Math.min(Math.max(value, 0), 5);

  return (
    <Rating
      value={clampedValue}
      count={5}
      readOnly // 💡 클릭 불가 (단순 보여주기용)
      fractions={100} // 💡 0.01 단위까지 정밀하게 채워줌 (1/100 단위)
      classNames={{ 
        root: styles.ratingRoot,
        symbolBody: styles.ratingItem 
      }}
      
      emptySymbol={
        <Image 
          src="/images/heart-rating/emptyheart.svg" 
          alt="empty" 
          width={width} 
          height={height} 
        />
      }
      
      fullSymbol={
        <Image 
          src="/images/heart-rating/fullheart.svg" 
          alt="full" 
          width={width} 
          height={height} 
        />
      }
    />
  );
}