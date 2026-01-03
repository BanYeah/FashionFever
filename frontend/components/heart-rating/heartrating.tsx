import classes from './heartrating.module.css';
import Image from 'next/image';
import { Rating } from '@mantine/core';


interface HeartRatingProps {
  value: number; 
  unitW: number;
  unitH: number;
}

export default function HeartRating({ value, unitW, unitH }: HeartRatingProps) {
  const clampedValue = Math.min(Math.max(value, 0), 5);

  return (
    <Rating
      value={clampedValue}
      count={5}
      readOnly 
      fractions={100} 
      classNames={{ 
        root: classes.ratingRoot,
        symbolBody: classes.ratingItem 
      }}
      
      emptySymbol={
        <Image 
          src="/images/heart-rating/emptyheart.svg" 
          alt="empty" 
          width={unitW} 
          height={unitH} 
        />
      }
      
      fullSymbol={
        <Image 
          src="/images/heart-rating/fullheart.svg" 
          alt="full" 
          width={unitW} 
          height={unitH} 
        />
      }
    />
  );
}