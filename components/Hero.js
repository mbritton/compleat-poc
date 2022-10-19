import styles from '@/styles/Hero.module.scss';
import useEmblaCarousel from 'embla-carousel-react';
import { useState } from 'react';
import { BsXLg } from 'react-icons/bs';
import Carousel from './Carousel';
import RightOverlay from './RightOverlay';

const SLIDE_COUNT = 5;
const slides = Array.from(Array(SLIDE_COUNT).keys());

const Hero = ({ children }) => {
  return (
    <div className={styles.hero}>
      <RightOverlay title="Overlay Title"></RightOverlay>
      <Carousel slides={slides}></Carousel>
    </div>
  );
};

export default Hero;
