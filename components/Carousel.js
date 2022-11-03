import styles from '@/styles/Carousel.module.scss';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { mediaByIndex } from '../media';
import { HeroContext } from './HeroContext';

const Carousel = (props) => {
  const [viewportRef, embla] = useEmblaCarousel({
    axis: 'y',
    skipSnaps: false,
  });
  const [tempSelectedIndex, setTempSelectedIndex] = useState(0);

  const heroContext = useContext(HeroContext);

  const scrollTo = useCallback(
    (index) => {
      embla && embla.scrollTo(index);
    },
    [embla],
  );

  const onSelect = useCallback(() => {
    if (!embla) return;
    props.handleCarouselScrub(embla.selectedScrollSnap());
  }, [embla, props]);

  useEffect(() => {
    if (!embla) return;
    embla.on('select', onSelect);
    embla.on('reInit', onSelect);
    scrollTo(heroContext.selectedNum);
  }, [embla, heroContext.selectedNum, onSelect, scrollTo]);

  return (
    <div className={styles.embla}>
      <div className={styles.embla__viewport} ref={viewportRef}>
        <div className={styles.embla__container}>
          {props.slides.map((index) => (
            <div className={styles.embla__slide} key={index}>
              <div className={styles.embla__slide__inner}>
                <Image
                  className={styles.embla__slide__img}
                  src={mediaByIndex(index).src}
                  width={window.innerWidth}
                  height={600} alt=""
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
