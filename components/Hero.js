import styles from '@/styles/Hero.module.scss';
import { motion } from 'framer-motion';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { getSlides } from '../media';
import Carousel from './Carousel';
import { HeroContext } from './HeroContext';
import RightOverlay from './RightOverlay';

const SLIDE_COUNT = 5;
const slides = Array.from(Array(SLIDE_COUNT).keys());

const easing = [1, 0.5, 0.5, 0.5];

const scaleUpVertical = {
  initial: {
    height: 200,
    opacity: 0,
  },
  animate: {
    height: 300,
    opacity: 1,
    transition: {
      duration: .5,
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
  const [slide, setSlide] = useState(slides[0]);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedNum, setSelectedNum] = useState(0);

  const handleCarouselActions = 
    (slideIndex) => {
      setSlide(getSlides(slideIndex));
      setSelectedNum(slideIndex);
    };

  useEffect(() => {
    setSlide(getSlides(0));
    
  }, []);

  useEffect(() => {
    console.log('overlayOpen', overlayOpen);
  }, [setOverlayOpen, overlayOpen]);

  return (
    <HeroContext.Provider
      value={{ selectedNum, setSelectedNum, slide, setSlide, overlayOpen, setOverlayOpen }}
    >
      <motion.div
        className={styles.hero}
        variants={scaleUpVertical}
        exit={{ opacity: 0 }}
        initial="initial"
        animate="animate"
        onAnimationComplete={() => {
          setTimeout(() => {
            setOverlayOpen(true);
          }, 500);
        }}
      >
        <RightOverlay
          slide={slide}
          isOpen={overlayOpen}
          slides={slides}
          handleSlide={handleCarouselActions}
        ></RightOverlay>
        <Carousel
          handleCarouselScrub={handleCarouselActions}
          slides={slides}
        ></Carousel>
      </motion.div>
    </HeroContext.Provider>
  );
};

export default Hero;
