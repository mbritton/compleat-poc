import { RightOverlayButton } from '@/components/Core';
import styles from '@/styles/RightOverlay.module.scss';
import { BiDetail } from 'react-icons/bi';
import { BsXLg } from 'react-icons/bs';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CarouselDots from './CarouselDots';
import useEmblaCarousel from 'embla-carousel-react';

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

const RightOverlay = ({ content, title, slides, handleSlide }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);
  return (
    <div className={isOpen ? styles.rightOverlay : styles.rightOverlayClosed}>
      <motion.div
        className={styles.closeIcon}
        variants={fadeInRight}
        exit={{ opacity: 0 }}
        initial="initial"
        animate="animate"
      >
        {!isOpen ? (
          <BiDetail
            className={styles.windowIcon}
            onClick={handleOpen}
          ></BiDetail>
        ) : (
          <></>
        )}
        {isOpen ? <BsXLg onClick={handleOpen}></BsXLg> : <></>}
      </motion.div>
      {isOpen && (
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
