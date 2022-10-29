import { RightOverlayButton } from '@/components/Core';
import styles from '@/styles/RightOverlay.module.scss';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { BiDetail, BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { BsXLg } from 'react-icons/bs';
import CarouselDots from './CarouselDots';

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

const RightOverlay = ({
  isOpen,
  content,
  title,
  slides,
  handleSlide,
  slideIndexNum,
}) => {
  const [myOpen, setMyOpen] = useState(!!isOpen);

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
            {title}
          </motion.h1>
          <motion.div variants={fadeInUp} className={styles.overlayText}>
            {content}
          </motion.div>
          <RightOverlayButton onClick={handleOpen}>
            Overlay Button
          </RightOverlayButton>
          <div className={styles.bottomBand}>
            <CarouselDots
              slideIndex={slideIndexNum}
              handleSlide={handleSlide}
              slides={slides}
            ></CarouselDots>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RightOverlay;
