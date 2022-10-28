import { CalloutCardButton } from '@/components/Core';
import styles from '@/styles/BottomCards.module.scss';
import { motion } from 'framer-motion';

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

const BottomCards = ({ cards, children }) => {
  return (
    <div className={styles.heroBottomCards}>
      <motion.div variants={stagger} className={styles.heroBottomCards}>
        {cards.map((card, i) => (
          <motion.div
            key={i + 'key'}
            variants={fadeInUp}
            className={styles.card}
          >
            <div className={styles.innerCard}>
              <div className={styles.innerTop}>
                <div className={styles.innerTopPicture}></div>
                <div className={styles.innerTopText}>
                  <h2>{card.title}</h2>
                  {card.content}
                  <CalloutCardButton primary>Go</CalloutCardButton>
                </div>
              </div>
              <div className={styles.innerBottom}></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      {/* <div className={styles.card}></div>
      <div className={styles.card}></div>
      <div className={styles.card}></div>
      <div className={styles.card}></div> */}
    </div>
  );
};

export default BottomCards;
