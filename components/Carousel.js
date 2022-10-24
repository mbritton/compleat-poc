import styles from '@/styles/Carousel.module.scss';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { mediaByIndex } from '../media';
import { CarouselSmallButton } from './Core';

const Carousel = ({ handleSlide, slides }) => {
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
    console.log('onSelect');
    handleSlide(selectedIndex, mediaByIndex(selectedIndex));
    // if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
  }, [embla, handleSlide, selectedIndex]);

  useEffect(() => {
    if (!embla) return;
    setScrollSnaps(embla.scrollSnapList());
    embla.on('select', onSelect);
    embla.on('reInit', onSelect);
    onSelect();
  }, [embla, setScrollSnaps, onSelect]);

  return (
    <>
      <div className={styles.embla}>
        <div className={styles.embla__viewport} ref={viewportRef}>
          <div className={styles.embla__container}>
            {slides.map((index) => (
              <div className={styles.embla__slide} key={index}>
                <div className={styles.embla__slide__inner}>
                  <img
                    className={styles.embla__slide__img}
                    src={mediaByIndex(index).src}
                    alt={mediaByIndex(index).src}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.carouselButtonsWrapper}>
          <div className="embla__dots">
            {scrollSnaps.map((_, index) => (
              <CarouselSmallButton
                key={index}
                selected={index === selectedIndex}
                onClick={() => scrollTo(index)}
              ></CarouselSmallButton>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Carousel;
