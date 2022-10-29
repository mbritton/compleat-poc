import { CalloutCardButton } from '@/components/Core';
import styles from '@/styles/BottomCards.module.scss';
import { motion } from 'framer-motion';
import { addRequestMeta } from 'next/dist/server/request-meta';
import Image from 'next/image';
import { cardByIndex, cardBottomsByIndex } from '../media';

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
      staggerChildren: 0.2,
    },
  },
};

const outputCardImage = (image) => {
  return;
};

const BottomCards = ({ cards }) => {
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
                <div className={styles.innerTopPicture}>
                  <Image
                    objectFit="cover"
                    objectPosition="top left"
                    src={cardByIndex(i)}
                    width={154}
                    height={182}
                  />
                </div>
                <div className={styles.innerTopText}>
                  <h2>{card.title}</h2>
                  {card.content}
                  <CalloutCardButton primary>Go</CalloutCardButton>
                </div>
              </div>
              <div className={styles.innerBottom}>
                <Image
                  objectFit="none"
                  objectPosition="top left"
                  src={cardBottomsByIndex(i)}
                  width={260}
                  height={182}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default BottomCards;
