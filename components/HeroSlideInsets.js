import styles from '@/styles/HeroSlideInsets.module.scss';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
    y: 100,
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

const HeroSlideInsets = ({ slide }) => {
  return (
    <motion.div exit={{ opacity: 1 }} className={styles.insetsOuterWrapper}>
      <motion.div animate={fadeInUp} className={styles.insetsMiddleWrapper}>
        {slide.inset && slide.inset && slide.inset.src && slide.inset.title ? (
          <div className={styles.insetsWrapper}>
            <Image
              objectFit="cover"
              objectPosition="top left"
              src={slide.inset.src}
              width={600}
              height={266}
              alt={slide.inset.title}
            />
          </div>
        ) : null}
        <div animate={fadeInRight} className={styles.insetsDescriptionWrapper}>
          <h2>
            {typeof slide !== 'number' && slide.inset ? slide.inset.title : ''}
          </h2>
          {typeof slide !== 'number' && slide.inset ? slide.inset.content : ''}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeroSlideInsets;
