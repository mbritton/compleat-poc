import styles from '@/styles/Carousel.module.scss';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useContext, useEffect } from 'react';
import { CarouselContext } from '@/components/CarouselContext';
import { stairTypeTitles } from '../media';

const Carousel = (props) => {
  const [viewportRef, embla] = useEmblaCarousel({
    axis: 'y',
    skipSnaps: true,
    startIndex: 0,
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
          {stairTypeTitles.map((slideNode, index) => (
            <div className={styles.embla__slide} key={index}>
              <img className={styles.carouselImage} src={props.slideLookupFunction(index).src} alt={slideNode.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
