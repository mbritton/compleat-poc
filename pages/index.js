import Head from 'next/head';
import Image from 'next/image';
import styles from '@/styles/Layout.module.scss';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.rightOverlay}></div>
      <div className={styles.hero}></div>
      <div className={styles.heroBottomCards}>
        <div className={styles.card}>
          <div className={styles.innerCard}>
            <div className={styles.innerTop}>
              <div className={styles.innerTopPicture}></div>
              <div className={styles.innerTopText}>
                <h2>Callout Title</h2>
                Laboris enim occaecat voluptate officia Lorem esse esse
                consectetur eiusmod tempor enim aute.
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
                Laboris enim occaecat voluptate officia Lorem esse esse
                consectetur eiusmod tempor enim aute.
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
                Laboris enim occaecat voluptate officia Lorem esse esse
                consectetur eiusmod tempor enim aute.
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
                Laboris enim occaecat voluptate officia Lorem esse esse
                consectetur eiusmod tempor enim aute.
              </div>
            </div>
            <div className={styles.innerBottom}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
