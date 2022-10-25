import styles from '@/styles/Hero.module.scss';
import { useCallback, useEffect, useState } from 'react';
import Carousel from './Carousel';
import RightOverlay from './RightOverlay';
import { getSlides } from '../media';
import { motion } from 'framer-motion';
import { boolean } from 'yup';

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
      duration: 0.4,
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
  const [slide, setSlide] = useState(slides[0]);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const handleEmbla = useCallback((emblaInstance) => {
    console.log('emblaInstance', emblaInstance);
  }, []);
  const handleSlide = useCallback(
    (slideIndex) => {
      // setOverlayOpen(true);
      // TODO: send new index to carousel component
      setSlide(getSlides(slideIndex));
    },
    [setSlide],
  );

  const handleAnimationComplete = useCallback(() => {
    console.log('handleAnimationComplete', overlayOpen);
    setOverlayOpen(!overlayOpen);
  }, [overlayOpen]);

  return (
    <motion.div
      className={styles.hero}
      variants={scaleUpVertical}
      exit={{ opacity: 0 }}
      initial="initial"
      animate="animate"
      onAnimationComplete={() => handleAnimationComplete()}
    >
      <RightOverlay
        isOpen={overlayOpen}
        slides={slides}
        content={slide.content}
        title={slide.title}
        handleSlide={handleSlide}
      ></RightOverlay>
      <Carousel
        setEmblaObj={handleEmbla}
        handleSlide={handleSlide}
        slides={slides}
      ></Carousel>
    </motion.div>
  );
};

export default Hero;
