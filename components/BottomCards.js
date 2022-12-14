import styles from '@/styles/BottomCards.module.scss';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cardByIndex, cardBottomsByIndex } from '../media';
import parse from 'html-react-parser';
import { SliceZone } from '@prismicio/react';
import { createClient } from '../prismicio';
import { components } from '../slices';
import { useEffect } from 'react';

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

const BottomCards = ({ page, cards }) => {
  return (
    <motion.div variants={stagger} className={styles.heroBottomCards}>
      <SliceZone components={components} slices={page?.data.slices} />
      {cards.map((card, i) => (
        <motion.div key={i + 'key'} variants={fadeInUp} className={styles.card}>
          <div className={styles.innerCard}>
            <div className={styles.innerTop}>
              <div className={styles.innerTopPicture}>
                <Image
                  objectFit="cover"
                  objectPosition="top left"
                  src={cardByIndex(i)}
                  width={154}
                  height={182}
                  alt="card"
                />
              </div>
              <div className={styles.innerTopText}>
                <h2>{card.title}</h2>
                {parse(card.content)}
              </div>
            </div>
            <div className={styles.innerBottom}>
              <Image
                objectFit="contain"
                objectPosition="top center"
                src={cardBottomsByIndex(i)}
                width={260}
                height={182}
                alt="card"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default BottomCards;

export async function getStaticProps({ previewData }) {
  const client = createClient({ previewData });
  const page = await client.getSingle('home_bottom_cards');
  return {
    props: {
      page,
    },
  };
}
