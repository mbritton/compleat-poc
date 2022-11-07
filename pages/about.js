import { CalloutCardButton } from '@/components/Core';
import Hero from '@/components/Hero';
import styles from '@/styles/About.module.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { SliceZone } from '@prismicio/react';
import { createClient } from '../prismicio';
import { components } from '../slices';
import { prismicH } from '@prismicio/helpers';

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

export default function About({page}) {
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

  useEffect(() => {
    setTimeout(() => {
      console.log('page', page);
    }, 0);
  }, []);

  return (
    <motion.div
      variants={fadeInUp}
      exit={{ opacity: 0 }}
      initial="initial"
      animate="animate"
    >
      <div className={styles.container}>
        <div className={styles.aboutHero}>
          <SliceZone slices={page.data.slices} components={components} />
        </div>
        <div className={styles.homeContentSection}></div>
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