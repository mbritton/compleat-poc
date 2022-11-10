import styles from '@/styles/Carousel.module.scss';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useCallback, useContext, useEffect } from 'react';
import { CarouselContext } from './CarouselContext';

const Carousel = (props) => {
  const [viewportRef, embla] = useEmblaCarousel({
    axis: 'y',
    skipSnaps: false,
  });

  const currentContext = useContext(CarouselContext);

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
    scrollTo(currentContext.selectedNum);
  }, [embla, currentContext.selectedNum, onSelect, scrollTo]);

  return (
    <div className={styles.embla}>
      <div className={styles.embla__viewport} ref={viewportRef}>
        <div style={props.emblaContainerStyle}>
          {props.slides.map((index) => (
            <div
              className={styles.embla__slide}
              key={index}
            >
              <Image
                key={index + 'carouselImage' + Math.random()}
                className={styles.embla__slide__img}
                src={props.slideLookupFunction(index).src}
                width={window.innerWidth}
                height={600}
                objectFit="contain"
                objectPosition="top left"
                alt=""
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
