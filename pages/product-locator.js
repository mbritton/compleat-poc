import { ColorBox } from '@/components/Core';
import styles from '@/styles/ProductLocator.module.scss';
import { motion } from 'framer-motion';
import shuffle from 'lodash/shuffle';
import { useState } from 'react';
import MasonryWall from '../components/MasonryWall';

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

const data = [
  [`5em`, `rgba(0,0,0,.07)`],
  [`2em`, `rgba(0,0,0,.07)`],
  [`4em`, `rgba(0,0,0,.07)`],
  [`7em`, `rgba(0,0,0,.07)`],
  [`1em`, `rgba(0,0,0,.07)`],
  [`3em`, `rgba(0,0,0,.07)`],
  [`2em`, `rgba(0,0,0,.07)`],
  [`5em`, `rgba(0,0,0,.07)`],
  [`5em`, `rgba(0,0,0,.07)`],
];

const getRandomInt = (min, max) => {
  const _min = Math.ceil(min);
  const _max = Math.floor(max);
  return Math.floor(Math.random() * (_max - _min)) + _min;
};

export default function ProductLocator() {
  const [divs, setDivs] = useState(data.concat(data));

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
            <div className={styles.content}>
              <MasonryWall>
                {divs.map(([minHeight, background], index) => (
                  <ColorBox
                    key={index}
                    style={{ background, minHeight }}
                    onClick={() => setDivs(shuffle)}
                  >
                    <img
                      alt={index + Math.random(1)}
                      src={`https://picsum.photos/200/${getRandomInt(
                        200,
                        300,
                      )}/?${Math.random(1)}`}
                    />
                  </ColorBox>
                ))}
              </MasonryWall>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
