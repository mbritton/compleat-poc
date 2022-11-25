import Carousel from '@/components/Carousel';
import { CarouselContext } from '@/components/CarouselContext';
import RightOverlay from '@/components/RightOverlay';
import styles from '@/styles/Hero.module.scss';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { getFeatured, media, mediaByIndex } from '../media';
import HeroSlideInsets from '@/components/HeroSlideInsets';

const slides = Array.from(Array(media.length).keys());

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
      duration: 0.5,
      ease: easing,
    },
  },
};

const embla__container = {
  justifyContent: 'center',
  marginTop: '0',
  display: 'grid',
  gridAutoFlow: 'row',
  gridAutoColumns: '100%',
  userSelect: 'none',
  height: 300,
};

const Hero = () => {
  const [slide, setSlide] = useState(slides[0]);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedNum, setSelectedNum] = useState(0);

  const handleCarouselActions = (slideIndex) => {
    setSelectedNum(slideIndex);
    setSlide(getFeatured(slideIndex));
  };

  useEffect(() => {
    handleCarouselActions(0);
  }, []);

  return (
    <CarouselContext.Provider
      value={{
        selectedNum,
        setSelectedNum,
        slide,
        setSlide,
        overlayOpen,
        setOverlayOpen,
      }}
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
        <Carousel
          emblaContainerStyle={embla__container}
          slideLookupFunction={mediaByIndex}
          handleCarouselScrub={handleCarouselActions}
          slides={slides}
        ></Carousel>
        <HeroSlideInsets slide={slide}></HeroSlideInsets>
        {overlayOpen && (
          <RightOverlay
            slide={slide}
            isOpen={overlayOpen}
            slides={slides}
            handleSlide={handleCarouselActions}
          ></RightOverlay>
        )}
      </motion.div>
    </CarouselContext.Provider>
  );
};

export default Hero;
