import Carousel from '@/components/Carousel';
import { CarouselContext } from '@/components/CarouselContext';
import CarouselDots from '@/components/CarouselDots';
import styles from '@/styles/StairTypes.module.scss';
import { useEffect, useState } from 'react';
import { stairTypes, stairTypesByIndex, stairTypeTitles } from '../media';

const slides = Array.from(Array(stairTypes.length).keys());

const embla__container = {
  justifyContent: 'center',
  display: 'grid',
  gridAutoFlow: 'row',
  gridAutoColumns: '100%',
  userSelect: 'none',
  height: 300,
};

const StairTypes = () => {
  const [selectedNum, setSelectedNum] = useState(0);
  const [slide, setSlide] = useState();

  const handleCarouselActions = (slideIndex) => {
    setSelectedNum(slideIndex);
    setSlide(stairTypeTitles[slideIndex]);
  };

  useEffect(() => {
    handleCarouselActions(0);
  }, []);

  return (
    <div className={styles.stairTypesWrapper}>
      <div className={styles.stairTypesLeft}>
        <CarouselContext.Provider
          value={{
            selectedNum,
            setSelectedNum,
            slide,
            setSlide,
          }}
        >
          <Carousel
            emblaContainerStyle={embla__container}
            slideLookupFunction={stairTypesByIndex}
            handleCarouselScrub={handleCarouselActions}
            slides={slides}
          ></Carousel>
        </CarouselContext.Provider>
      </div>
      <div className={styles.stairTypesMiddle}>
        {stairTypeTitles[selectedNum].content}
        <div className={styles.stairTypesTitle}>
          <span className={styles.smallerTitle}>Stair</span> Types
        </div>
      </div>
      <div className={styles.stairTypesRight}>
        <CarouselDots
          isTextList={true}
          slideNodes={stairTypeTitles}
          slideIndex={selectedNum}
          handleSlide={handleCarouselActions}
          slides={slides}
        ></CarouselDots>
      </div>
    </div>
  );
};

export default StairTypes;
