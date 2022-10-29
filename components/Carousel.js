import styles from '@/styles/Carousel.module.scss';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { mediaByIndex } from '../media';

const Carousel = ({ slides, slideIndexNum, handleCarouselScrub, ref }) => {
  const [viewportRef, embla] = useEmblaCarousel({
    axis: 'y',
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollTo = useCallback(
    (index) => {
      embla && embla.scrollTo(index);
    },
    [embla],
  );

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
    handleCarouselScrub(selectedIndex);
  }, [embla, handleCarouselScrub, selectedIndex]);

  useEffect(() => {
    if (!embla) return;
    setScrollSnaps(embla.scrollSnapList());
    embla.on('select', onSelect);
    embla.on('reInit', onSelect);
    onSelect();
    console.log('slideIndexNum CHANGED', slideIndexNum);
  }, [embla, setScrollSnaps, onSelect, scrollTo, slideIndexNum]);

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
