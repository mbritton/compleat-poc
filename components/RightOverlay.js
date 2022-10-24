import { RightOverlayButton } from '@/components/Core';
import styles from '@/styles/RightOverlay.module.scss';
import { BiDetail } from 'react-icons/bi';
import { BsXLg } from 'react-icons/bs';
import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';

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
      {isOpen ? (
        <motion.div variants={stagger}>
          <motion.h1 variants={fadeInUp} className={styles.card}>
            {props.title}
          </motion.h1>
          <motion.div variants={fadeInUp} className={styles.overlayText}>
            {props.content}
          </motion.div>
          <RightOverlayButton onClick={handleOpen}>
            Overlay Button
          </RightOverlayButton>
          <div className={styles.bottomBand}></div>
        </motion.div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default RightOverlay;
