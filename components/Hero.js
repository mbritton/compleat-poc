import styles from '@/styles/Hero.module.scss';
import useEmblaCarousel from 'embla-carousel-react';
import { useState } from 'react';
import { BsXLg } from 'react-icons/bs';
import Carousel from './Carousel';
import { RightOverlayButton } from './Core';

const SLIDE_COUNT = 5;
const slides = Array.from(Array(SLIDE_COUNT).keys());

const Hero = ({ children }) => {
  const [emblaRef] = useEmblaCarousel();
  const [isOpen, setIsOpen] = useState(true);

  const RightOverlay = () => {
    return (
      <div className={styles.rightOverlay}>
        <div className={styles.closeIcon}>
          <BsXLg
            onClick={() => {
              setIsOpen(false);
            }}
          ></BsXLg>
        </div>
        <h1>Overlay Title</h1>
        <div className={styles.overlayText}>
          Sint nisi pariatur eu irure ipsum eiusmod Lorem tempor commodo dolor
          anim eiusmod incididunt magna.
        </div>
        <RightOverlayButton>Overlay Button</RightOverlayButton>
      </div>
    );
  };

  return (
    <div className={styles.hero}>
      <RightOverlay></RightOverlay>
      <Carousel slides={slides}></Carousel>
    </div>
  );
};

export default Hero;
