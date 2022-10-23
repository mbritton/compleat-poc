import { CalloutCardButton } from '@/components/Core';
import Hero from '@/components/Hero';
import styles from '@/styles/Layout.module.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    setTimeout(
      () =>
        AOS.init({
          // Global settings:
          disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
          startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
          initClassName: 'aos-init', // class applied after initialization
          animatedClassName: 'aos-animate', // class applied on animation
          useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
          disableMutationObserver: false, // disables automatic mutations' detections (advanced)
          debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
          throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)
          // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
          offset: 120, // offset (in px) from the original trigger point
          delay: 100, // values from 0 to 3000, with step 50ms
          duration: 1000, // values from 0 to 3000, with step 50ms
          easing: 'ease', // default easing for AOS animations
          once: false, // whether animation should happen only once - while scrolling down
          mirror: false, // whether elements should animate out while scrolling past them
          anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation
        }),
      1000,
    );
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
              <div className={styles.innerTopText}>
                <h2>Callout Title</h2>
                Laboris enim occaecat voluptate officia.
                <CalloutCardButton>Go</CalloutCardButton>
              </div>
              <div className={styles.innerTopPicture}></div>
            </div>
            <div className={styles.innerBottom}></div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.innerCard}>
            <div className={styles.innerTop}>
              <div className={styles.innerTopText}>
                <h2>Callout Title</h2>
                Laboris enim occaecat voluptate officia.
                <CalloutCardButton>Go</CalloutCardButton>
              </div>
              <div className={styles.innerTopPicture}></div>
            </div>
            <div className={styles.innerBottom}></div>
          </div>
        </div>
      </div>
      <div className={styles.homeContentSection}>
        <div
          className={styles.homeContentChunk}
          data-aos="fade-down-left"
        ></div>
        <div
          className={styles.homeContentChunk}
          data-aos="fade-down-right"
        ></div>
        <div
          className={styles.homeContentChunk}
          data-aos="fade-down-left"
        ></div>
        <div
          className={styles.homeContentChunk}
          data-aos="fade-down-right"
        ></div>
        <div
          className={styles.homeContentChunk}
          data-aos="fade-down-left"
        ></div>
      </div>
    </div>
  );
}
