import styles from '@/styles/Hero.module.scss';
import { BsXLg } from 'react-icons/bs';
import { RightOverlayButton } from './Core';

const Hero = ({ children }) => {
  return (
    <div className={styles.hero}>
      <div className={styles.rightOverlay}>
        <div className={styles.closeIcon}>
          <BsXLg></BsXLg>
        </div>
        <h1>Overlay Title</h1>
        <div className={styles.overlayText}>
          Sint nisi pariatur eu irure ipsum eiusmod Lorem tempor commodo dolor
          anim eiusmod incididunt magna.
        </div>
        <RightOverlayButton>Overlay Button</RightOverlayButton>
      </div>
    </div>
  );
};

export default Hero;
