import styles from '@/styles/HeroSlideInsets.module.scss';
import Image from 'next/image';
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

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.5,
    },
  },
};

const HeroSlideInsets = ({ slide }) => {
  return (
    <motion.div
      variants={stagger}
      exit={{ opacity: 0 }}
    >
      <motion.div
        animate={fadeInUp}
        className={styles.insetsWrapper}
      >
        <Image
          objectFit="cover"
          objectPosition="top left"
          src={slide.inset.src}
          width={600}
          height={266}
          alt={slide.inset.title}
        />
      </motion.div>
      <motion.div
        animate={fadeInRight}
        className={styles.insetsDescriptionWrapper}
      >
        <h2>{slide.inset.title}</h2>
        {slide.inset.content}
      </motion.div>
    </motion.div>
  );
};

export default HeroSlideInsets;
