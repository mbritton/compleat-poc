import usePrismicSlides from '@/hooks/usePrismicSlides';
import styles from '@/styles/About.module.scss';
import { SliceZone } from '@prismicio/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { createClient } from '../prismicio';
import { components } from '../slices';

const PAGE_NAME = 'about';

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
const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function About({ page }) {
  const { outputImageURL, outputTextSlices } = usePrismicSlides();

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
    <motion.div
      variants={fadeInUp}
      exit={{ opacity: 0 }}
      initial="initial"
      animate="animate"
    >
      <div className={styles.aboutHero}>
        <div
          className={styles.aboutHero__content}
          style={{
            backgroundImage: outputImageURL(
              page.data.slices,
              `${PAGE_NAME}_images`,
              `${PAGE_NAME}hero_content`,
            ),
          }}
        >
          &nbsp;
        </div>
        <div
          className={styles.aboutHero__right}
          style={{
            backgroundImage: outputImageURL(
              page.data.slices,
              `${PAGE_NAME}_images`,
              `${PAGE_NAME}Hero_right`,
            ),
          }}
        >
          &nbsp;
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.sliceZone}>
          <div className={styles.sliceZoneWhite}>
            <SliceZone
              slices={outputTextSlices(page.data.slices, `${PAGE_NAME}_text`)}
              components={components}
            />
            <div
              className={styles.rightVertical}
              style={{
                backgroundImage: outputImageURL(
                  page.data.slices,
                  `${PAGE_NAME}_images`,
                  'rightvertical',
                ),
              }}
            ></div>
          </div>
          <div
            className={styles.aboutHero__belowSquareL}
            style={{
              backgroundImage: outputImageURL(
                page.data.slices,
                `${PAGE_NAME}_images`,
                'abouthero_belowsquarel',
              ),
            }}
          >
            &nbsp;
          </div>
          <div
            className={styles.aboutHero__belowSquareR}
            style={{
              backgroundImage: outputImageURL(
                page.data.slices,
                `${PAGE_NAME}_images`,
                'aboutHero_belowSquareR',
              ),
            }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
}

export async function getStaticProps({ previewData }) {
  const client = createClient({ previewData });
  const page = await client.getSingle('about_page_text');
  return {
    props: {
      page,
    },
  };
}
