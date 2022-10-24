import styles from '@/styles/Hero.module.scss';
import { useCallback, useState } from 'react';
import Carousel from './Carousel';
import RightOverlay from './RightOverlay';
import { getSlides } from '../media';

const SLIDE_COUNT = 5;
const slides = Array.from(Array(SLIDE_COUNT).keys());

const Hero = () => {
  const [slide, setSlide] = useState(slides[0]);
  const handleSlide = useCallback(
    (slideIndex) => {
      // TODO: send new index to carousel component
      console.log('slideIndex', slideIndex);
      setSlide(getSlides(slideIndex));
    },
    [setSlide],
  );
  return (
    <div className={styles.hero}>
      <RightOverlay
        slides={slides}
        content={slide.content}
        title={slide.title}
        handleSlide={handleSlide}
      ></RightOverlay>
      <Carousel handleSlide={handleSlide} slides={slides}></Carousel>
    </div>
  );
};

export default Hero;
