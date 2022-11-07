import { RightOverlayButton } from '@/components/Core';
import styles from '@/styles/RightOverlay.module.scss';
import { motion } from 'framer-motion';
import { useCallback, useContext, useEffect, useState } from 'react';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { boolean } from 'yup';
import CarouselDots from './CarouselDots';
import { HeroContext } from './HeroContext';

const easing = [1, 0.5, 0.5, 0.5];

const fadeInUp = {
  initial: {
    y: 10,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: easing,
    },
  },
};

const fadeInRight = {
  initial: {
    x: 10,
    opacity: 0,
  },
  animate: {
    x: 0,
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
      staggerChildren: 0.3,
    },
  },
};

const RightOverlay = (props) => {
  const heroContext = useContext(HeroContext);

  const handleOpen = useCallback((doOpen) => {
    // setMyOpen(!heroContext.overlayOpen);
    heroContext.setOverlayOpen(doOpen);
  }, [heroContext.setOverlayOpen]);

  const outputChevron = useCallback(() => {
    return !heroContext.overlayOpen ? (
      <div className={styles.topControlsWrapper}>
        <div className={styles.openOverlay} onClick={() => handleOpen(true)}>
          <BiChevronsLeft></BiChevronsLeft>
        </div>
      </div>
    ) : (
      <BiChevronsRight
        className={styles.windowIcon}
        onClick={() => handleOpen(false)}
      ></BiChevronsRight>
    );
  }, [handleOpen, heroContext.overlayOpen]);

  return (
    <div
      className={
        heroContext.overlayOpen
          ? styles.rightOverlay
          : styles.rightOverlayClosed
      }
    >
      <motion.div
        className={
          !heroContext.overlayOpen ? styles.closeIconOpen : styles.closeIcon
        }
        variants={fadeInRight}
        exit={{ opacity: 1 }}
        initial="initial"
        animate="animate"
      >
        {outputChevron()}
      </motion.div>
      {heroContext.overlayOpen && (
        <motion.div variants={stagger}>
          <motion.h1 variants={fadeInUp} className={styles.card}>
            {heroContext.slide.title}
          </motion.h1>
          <motion.div variants={fadeInUp} className={styles.overlayText}>
            {heroContext.slide.content}
          </motion.div>
          <RightOverlayButton onClick={() => handleOpen(false)}>
            Overlay Button
          </RightOverlayButton>
          <div className={styles.bottomBand}>
            <CarouselDots
              slideIndex={heroContext.selectedNum}
              handleSlide={props.handleSlide}
              slides={props.slides}
            ></CarouselDots>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RightOverlay;
