import styles from '@/styles/Carousel.module.scss';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { mediaByIndex } from '../media';
import Image from 'next/image';

const Carousel = ({ slides, slideIndexNum }) => {
  const [viewportRef, embla] = useEmblaCarousel({
    axis: 'y',
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollTo = useCallback(
    (index) => embla && embla.scrollTo(index),
    [embla],
  );

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    setScrollSnaps(embla.scrollSnapList());
    embla.on('select', onSelect);
    embla.on('reInit', onSelect);
    onSelect();
    scrollTo(slideIndexNum);
  }, [embla, setScrollSnaps, onSelect, slideIndexNum, scrollTo]);

  return (
    <>
      <div className={styles.embla}>
        <div className={styles.embla__viewport} ref={viewportRef}>
          <div className={styles.embla__container}>
            {slides.map((index) => (
              <div className={styles.embla__slide} key={index}>
                <div className={styles.embla__slide__inner}>
                  <Image
                    className={styles.embla__slide__img}
                    src={mediaByIndex(index).src}
                    width={window.innerWidth}
                    height={600}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Carousel;
