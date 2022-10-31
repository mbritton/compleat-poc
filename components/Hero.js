import styles from '@/styles/Hero.module.scss';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import Carousel from './Carousel';
import RightOverlay from './RightOverlay';
import { getSlides } from '../media';
import { motion } from 'framer-motion';
import { HeroContext } from './HeroContext';

const SLIDE_COUNT = 5;
const slides = Array.from(Array(SLIDE_COUNT).keys());

const easing = [1, 0.5, 0.5, 0.5];

const scaleUpVertical = {
  initial: {
    height: 280,
    opacity: 1,
  },
  animate: {
    height: 300,
    opacity: 1,
    transition: {
      duration: 1,
      ease: easing,
    },
  },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Hero = () => {
  // Used in context
  const heroContext = useContext(HeroContext);
  const [slide, setSlide] = useState(slides[0]);
  const [overlayOpen, setOverlayOpen] = useState(true);
  const [selectedNum, setSelectedNum] = useState(0);

  const handleControlDot = (slideIndex) => {
    setSlide(getSlides(slideIndex));
    setSelectedNum(slideIndex);
  };

  const handleCarouselScrub = (slideIndex) => {
  };

  useEffect(() => {
    setSlide(getSlides(0));
  }, []);

  return (
    <HeroContext.Provider
      value={{ selectedNum, setSelectedNum, slide, setSlide }}
    >
      <motion.div
        className={styles.hero}
        variants={scaleUpVertical}
        exit={{ opacity: 0 }}
        initial="initial"
        animate="animate"
        onAnimationComplete={() => setOverlayOpen(!overlayOpen)}
      >
        <RightOverlay
          slide={slide}
          isOpen={overlayOpen}
          slides={slides}
          handleSlide={handleControlDot}
        ></RightOverlay>
        <Carousel
          handleCarouselScrub={handleCarouselScrub}
          slides={slides}
        ></Carousel>
      </motion.div>
    </HeroContext.Provider>
  );
};

export default Hero;
