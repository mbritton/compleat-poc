import { CarouselContext } from '@/components/CarouselContext';
import CarouselDots from '@/components/CarouselDots';
import styles from '@/styles/RightOverlay.module.scss';
import { motion } from 'framer-motion';
import { useCallback, useContext } from 'react';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import HeroSlideInsets from './HeroSlideInsets';

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

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const RightOverlay = (props) => {
  const carouselContext = useContext(CarouselContext);

  return (
    <div
      className={
        carouselContext.overlayOpen
          ? styles.rightOverlay
          : styles.rightOverlayClosed
      }
    >
      {carouselContext.overlayOpen && (
        <motion.div variants={stagger}>
          <motion.h1 variants={fadeInUp}>
            {carouselContext.slide.title}
          </motion.h1>
          <motion.div variants={fadeInUp} className={styles.overlayText}>
            {carouselContext.slide.content}
          </motion.div>
          <div className={styles.bottomBand}>
            <CarouselDots
              isTextList={false}
              slideNodes={carouselContext.slides}
              slideIndex={carouselContext.selectedNum}
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
