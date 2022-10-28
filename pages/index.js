import BottomCards from '@/components/BottomCards';
import Hero from '@/components/Hero';
import styles from '@/styles/Layout.module.scss';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';
import { getCards } from '../media';

const easing = [1, 0.5, 0.5, 0.5];

const fadeIn = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: easing,
    },
  },
};

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

const growDown = {
  initial: {
    width: 0,
  },
  animate: {
    width: '20%',
    transition: {
      duration: 0.4,
      ease: easing,
    },
  },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function Home() {
  const cards = getCards();
  return (
    <motion.div
      variants={fadeIn}
      exit={{ opacity: 0 }}
      initial="initial"
      animate="animate"
    >
      <div className={styles.container}>
        <div className={styles.rightOverlay}></div>
        <Hero></Hero>
        <motion.div variants={stagger} className={styles.heroBottomCards}>
          <BottomCards cards={cards} />
        </motion.div>
        <div className={styles.homeContentSection}>
          <div className={styles.homeContentChunk} data-aos="fade-up"></div>
          <div className={styles.homeContentChunk} data-aos="fade-up"></div>
          <div className={styles.homeContentChunk} data-aos="fade-up"></div>
          <div className={styles.homeContentChunk} data-aos="fade-up"></div>
          <div className={styles.homeContentChunk} data-aos="fade-up"></div>
        </div>
      </div>
    </motion.div>
  );
}
