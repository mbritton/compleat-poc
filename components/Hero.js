import styles from '@/styles/Hero.module.scss';
import { BsXLg } from 'react-icons/bs';

const Hero = ({ children }) => {
  return (
    <div className={styles.hero}>
      <div className={styles.rightOverlay}>
        <div className={styles.closeIcon}>
          <BsXLg></BsXLg>
        </div>
      </div>
    </div>
  );
};

export default Hero;
