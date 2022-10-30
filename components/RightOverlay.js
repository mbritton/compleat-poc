import { RightOverlayButton } from '@/components/Core';
import styles from '@/styles/RightOverlay.module.scss';
import { motion } from 'framer-motion';
import { useCallback, useContext, useEffect, useState } from 'react';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
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
      staggerChildren: 0.1,
    },
  },
};

const RightOverlay = (props) => {
  const heroContext = useContext(HeroContext);
  const [myOpen, setMyOpen] = useState(!!props.isOpen);

  const handleOpen = useCallback(() => {
    setMyOpen(!myOpen);
  }, [myOpen]);

  return (
    <div
      className={
        myOpen === true ? styles.rightOverlay : styles.rightOverlayClosed
      }
    >
      <motion.div
        className={myOpen ? styles.closeIconOpen : styles.closeIcon}
        variants={fadeInRight}
        exit={{ opacity: 1 }}
        initial="initial"
        animate="animate"
      >
        {!myOpen ? (
          <div className={styles.topControlsWrapper}>
            <div className={styles.openOverlay}>
              <BiChevronsLeft onClick={handleOpen}></BiChevronsLeft>
            </div>
          </div>
        ) : (
          <BiChevronsRight
            className={styles.windowIcon}
            onClick={handleOpen}
          ></BiChevronsRight>
        )}
      </motion.div>
      {myOpen && (
        <motion.div variants={stagger}>
          <motion.h1 variants={fadeInUp} className={styles.card}>
            {heroContext.slide.title}
          </motion.h1>
          <motion.div variants={fadeInUp} className={styles.overlayText}>
            {heroContext.slide.content}
          </motion.div>
          <RightOverlayButton onClick={handleOpen}>
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
