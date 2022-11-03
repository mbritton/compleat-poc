import styles from '@/styles/ProductLocator.module.scss';
import { motion } from 'framer-motion';
import MasonryWall from '../components/MasonryWall';
import shuffle from 'lodash/shuffle';
import styled from 'styled-components';
import { useState } from 'react';

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

const ColorBox = styled.div`
  border-radius: 0;
  transition: 0.5s;
  justify-content: center;
  align-content: center;
  display: grid;
  color: black;
  cursor: pointer;
  :hover {
    transform: scale(1.06);
    box-shadow: 0 0 12px 0 ${(props) => props.theme.lightGray};
    border-radius: 12px
  }
`;

const data = [
  [`5em`, `rgba(0,0,0,.1)`],
  [`2em`, `rgba(0,0,0,.1)`],
  [`4em`, `rgba(0,0,0,.1)`],
  [`7em`, `rgba(0,0,0,.1)`],
  [`1em`, `rgba(0,0,0,.1)`],
  [`3em`, `rgba(0,0,0,.1)`],
  [`2em`, `rgba(0,0,0,.1)`],
  [`5em`, `rgba(0,0,0,.1)`],
  [`5em`, `rgba(0,0,0,.1)`],
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
