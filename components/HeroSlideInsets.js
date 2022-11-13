import styles from '@/styles/HeroSlideInsets.module.scss';
import Image from 'next/image';
import { rightOverlayInsetsByIndex } from '../media';

const HeroSlideInsets = ({ slide, selectedSlideIndex }) => {
  return (
    <div className={styles.insetsWrapper}>
      <Image
        objectFit="cover"
        objectPosition="top center"
        src={rightOverlayInsetsByIndex(selectedSlideIndex)}
        width={399}
        height={236}
        alt={slide.title}
      />
    </div>
  );
};

export default HeroSlideInsets;
