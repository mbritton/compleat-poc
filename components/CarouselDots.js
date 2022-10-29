import styles from '@/styles/CarouselDots.module.scss';
import { useEffect, useState } from 'react';

const CarouselDots = ({ slides, handleSlide, slideIndex }) => {
  const [carouselSlides] = useState(slides);
  return (
    <>
      <div className={styles.carouselDotsWrapper}>
        {carouselSlides.map((slide, i) => (
          <div
            onClick={() => {
              handleSlide(i);
            }}
            className={
              i === slideIndex ? styles.carouselDotSelected : styles.carouselDot
            }
            key={i + 'slide'}
          ></div>
        ))}
      </div>
    </>
  );
};

export default CarouselDots;
