import styles from '@/styles/Hero.module.scss';
import { useCallback } from 'react';
import Carousel from './Carousel';
import RightOverlay from './RightOverlay';

const SLIDE_COUNT = 5;
const slides = Array.from(Array(SLIDE_COUNT).keys());

const Hero = () => {
  const handleSlide = useCallback((slideIndex) => {}, []);
  return (
    <div className={styles.hero}>
      <RightOverlay title="Overlay Title"></RightOverlay>
      <Carousel handleSlide={handleSlide} slides={slides}></Carousel>
    </div>
  );
};

export default Hero;
