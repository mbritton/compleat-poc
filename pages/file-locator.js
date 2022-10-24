import styles from '@/styles/FileLocator.module.scss';
import { motion } from 'framer-motion';

const easing = [0.6, 0.5, 0.1, 1];

const fadeInUp = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: easing,
    },
  },
};

export default function FileLocator() {
  return (
    <motion.div
      variants={fadeInUp}
      exit={{ opacity: 0 }}
      initial="initial"
      animate="animate"
    >
      <div className={styles.container}>
        <div className={styles.productLocatorHero}></div>
        <motion.div
          variants={fadeInUp}
          exit={{ opacity: 0 }}
          initial="initial"
          animate="animate"
        >
          <div className={styles.homeContentSection}>
            <div className={styles.leftMenu}> </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
