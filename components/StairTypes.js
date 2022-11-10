import styles from '@/styles/StairTypes.module.scss';
import { useContext, useEffect, useState } from 'react';
import { stairTypesByIndex, stairTypes, getStairTypeSlides } from '../media';
import Carousel from './Carousel';
import { CarouselContext } from './CarouselContext';
import CarouselDots from './CarouselDots';

const SLIDE_COUNT = 7;
const slides = Array.from(Array(SLIDE_COUNT).keys());
// const slides = getStairTypeSlides(0);

const embla__container = {
  justifyContent: 'center',
  marginTop: '-900px',
  display: 'flex',
  flexDirection: 'column',
  userSelect: 'none',
};

const StairTypes = ({ props }) => {
  const carouselContext = useContext(CarouselContext);
  const [selectedNum, setSelectedNum] = useState(0);
  const [slide, setSlide] = useState();

  const handleCarouselActions = (slideIndex) => {
    setSlide(getStairTypeSlides(slideIndex));
    setSelectedNum(slideIndex);
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
        <CarouselDots
          slideIndex={selectedNum}
          handleSlide={handleCarouselActions}
          slides={slides}
        ></CarouselDots>
      </div>
      <div className={styles.stairTypesRight}>right</div>
    </div>
  );
};

export default StairTypes;
