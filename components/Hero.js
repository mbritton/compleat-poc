import styles from '@/styles/Hero.module.scss';

const Hero = ({ children }) => {
  return (
    <div className={styles.hero}>
      <div className={styles.rightOverlay}></div>
    </div>
  );
};

export default Hero;
