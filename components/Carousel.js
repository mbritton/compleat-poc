import styles from '@/styles/Carousel.module.scss';
import { CarouselNextButton, CarouselPreviousButton } from './Core';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { mediaByIndex } from '../media';
import { BsArrowRight, BsArrowLeft } from 'react-icons/bs';

const Carousel = ({ slides }) => {
  const [viewportRef, embla] = useEmblaCarousel({ skipSnaps: false });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla]);
  const scrollTo = useCallback(
    (index) => embla && embla.scrollTo(index),
    [embla],
  );

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
    setPrevBtnEnabled(embla.canScrollPrev());
    setNextBtnEnabled(embla.canScrollNext());
  }, [embla, setSelectedIndex]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    setScrollSnaps(embla.scrollSnapList());
    embla.on('select', onSelect);
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
        <div className={styles.carouselWrapper}>
          <CarouselPreviousButton onClick={scrollPrev} enabled={prevBtnEnabled}>
            <BsArrowLeft></BsArrowLeft>
          </CarouselPreviousButton>
          <CarouselNextButton onClick={scrollNext}>
            <BsArrowRight></BsArrowRight>
          </CarouselNextButton>
        </div>
      </div>
    </>
  );
};

export default Carousel;
