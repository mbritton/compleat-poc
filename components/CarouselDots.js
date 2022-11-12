import styles from '@/styles/CarouselDots.module.scss';
import { useState } from 'react';

const CarouselDots = ({ isTextList, slides, handleSlide, slideIndex, slideNodes }) => {
  const [carouselSlides] = useState(slides);

  return (
    <>
      {!isTextList ? (
        <div className={styles.carouselDotsWrapper}>
          {carouselSlides.map((slide, i) => (
            <div
              onClick={() => {
                handleSlide(i);
              }}
              className={
                i === slideIndex
                  ? styles.carouselDotSelected
                  : styles.carouselDot
              }
              key={i + 'slide'}
            ></div>
          ))}
        </div>
      ) : (
        slideNodes &&
        slideNodes.map((slide, i) => (
          <div
            onMouseOver={() => handleSlide(i)}
            className={i === slideIndex ? styles.carouselTextItemSelected : styles.carouselTextItem}
            key={i + 'slide'}
          >
            {slide.title}
          </div>
        ))
      )}
    </>
  );
};

export default CarouselDots;
