import Head from 'next/head';
import Image from 'next/image';
import styles from '@/styles/Layout.module.scss';
import styled from 'styled-components';
import Hero from '@/components/Hero';

const Button = styled.button`
  /* Adapt the colors based on primary prop */
  background: ${(props) => (props.primary ? '#535353' : 'grey')};
  font-size: 12px;
  color: white;
  cursor: pointer;
  font-family: 'EB Garamond', serif;
  height: 30px;
  border: 0;
  border-radius: 0;
  width: 135px;
  min-height: 32px;
  max-height: 32px;
  margin: 10px 0 0 0;
`;

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.rightOverlay}></div>
      <Hero></Hero>
      <div className={styles.heroBottomCards}>
        <div className={styles.card}>
          <div className={styles.innerCard}>
            <div className={styles.innerTop}>
              <div className={styles.innerTopPicture}></div>
              <div className={styles.innerTopText}>
                <h2>Callout Title</h2>
                Laboris enim occaecat voluptate officia Lorem.
                <Button primary>Go</Button>
              </div>
            </div>
            <div className={styles.innerBottom}></div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.innerCard}>
            <div className={styles.innerTop}>
              <div className={styles.innerTopPicture}></div>
              <div className={styles.innerTopText}>
                <h2>Callout Title</h2>
                Laboris enim occaecat voluptate officia Lorem.
                <Button primary>Go</Button>
              </div>
            </div>
            <div className={styles.innerBottom}></div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.innerCard}>
            <div className={styles.innerTop}>
              <div className={styles.innerTopPicture}></div>
              <div className={styles.innerTopText}>
                <h2>Callout Title</h2>
                Laboris enim occaecat voluptate officia.
                <Button primary>Go</Button>
              </div>
            </div>
            <div className={styles.innerBottom}></div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.innerCard}>
            <div className={styles.innerTop}>
              <div className={styles.innerTopPicture}></div>
              <div className={styles.innerTopText}>
                <h2>Callout Title</h2>
                Laboris enim occaecat voluptate.
                <Button primary>Go</Button>
              </div>
            </div>
            <div className={styles.innerBottom}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
