import styles from '@/styles/HeroSlideInsets.module.scss';
import Image from 'next/image';
import { rightOverlayInsetsByIndex } from '../media';

const HeroSlideInsets = ({ slide, selectedSlideIndex }) => {
  return (
    <>
      <div className={styles.insetsWrapper}>
        <Image
          objectFit="cover"
          objectPosition="top left"
          src={rightOverlayInsetsByIndex(selectedSlideIndex)}
          width={600}
          height={266}
          alt={slide.title}
        />
      </div>
      <div className={styles.insetsDescriptionWrapper}>
        <h2>Holiday House</h2>
        Amet ut anim id ex pariatur exercitation quis ipsum. Est duis do sint in
        aliqua culpa id consequat enim deserunt nisi est. Ea sunt dolor officia
        enim eu sunt magna cupidatat aliqua incididunt eu quis culpa.
      </div>
    </>
  );
};

export default HeroSlideInsets;
