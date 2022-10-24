import styles from '@/styles/CarouselDots.module.scss';
import { useState } from 'react';

const CarouselDots = ({ slides, handleSlide }) => {
  const [carouselSlides] = useState(slides);

  return (
    <>
      <div className={styles.carouselDotsWrapper}>
        {carouselSlides.map((slide, i) => (
          <div
            onClick={() => handleSlide(i)}
            className={styles.carouselDot}
            key={i + 'slide'}
          ></div>
        ))}
      </div>
    </>
  );
};

export default CarouselDots;
