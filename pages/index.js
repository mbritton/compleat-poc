import { CalloutCardButton } from '@/components/Core';
import Hero from '@/components/Hero';
import styles from '@/styles/Layout.module.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    setTimeout(() => AOS.init(), 1000);
  }, []);

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
                <CalloutCardButton primary>Go</CalloutCardButton>
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
                <CalloutCardButton primary>Go</CalloutCardButton>
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
                <CalloutCardButton primary>Go</CalloutCardButton>
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
                <CalloutCardButton primary>Go</CalloutCardButton>
              </div>
            </div>
            <div className={styles.innerBottom}></div>
          </div>
        </div>
      </div>
      <div className={styles.homeContentSection}>
        <div className={styles.homeContentChunk} data-aos="fade-in"></div>
        <div className={styles.homeContentChunk} data-aos="fade-in"></div>
        <div className={styles.homeContentChunk} data-aos="fade-in"></div>
        <div className={styles.homeContentChunk} data-aos="fade-in"></div>
        <div className={styles.homeContentChunk} data-aos="fade-in"></div>
      </div>
    </div>
  );
}
