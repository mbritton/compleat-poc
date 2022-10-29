// Home page bottom cards, top row
import card1 from './media-06.jpg';
import card2 from './media-11.jpg';
import card3 from './media-12.jpg';
import card4 from './media-14.jpg';
// Home page bottom cards, bottom row
import card5 from './media-07.jpg';
import card6 from './media-08.jpg';
import card7 from './media-13.jpg';
import card8 from './media-15.jpg';

// Embla carousel images
import media1 from './media-1.jpg';
import media2 from './media-2.jpg';
import media3 from './media-3.jpg';
import media4 from './media-4.jpg';
import media5 from './media-5.jpeg';

export const getSlides = (index) => {
  const titles = [
    { title: 'Slide Title', content: 'Excepteur Lorem ipsum non occaecat.' },
    {
      title: 'Slide Title 2',
      content:
        'Excepteur nostrud aliquip exercitation quis proident occaecat ullamco.',
    },
    {
      title: 'Next Slide Title',
      content:
        'Mollit in irure anim excepteur nostrud eu minim do minim enim aliqua.',
    },
    {
      title: 'Next Slide Title 2',
      content: 'Sint consequat cillum sunt voluptate incididunt irure velit.',
    },
    {
      title: 'Next Slide Title 3',
      content:
        'Sit sunt exercitation quis officia elit dolor do voluptate consequat.',
    },
  ];
  return titles[index];
};

export const getCards = () => {
  return [
    {
      title: 'Modern System',
      content: 'Adipisicing dolor ullamco incididunt aute esse.',
      image: '/media/media-4.jpg',
    },
    {
      title: 'Craftsman',
      content: 'Ut non sit eu enim ut nisi.',
      image: '/media/media-4.jpg',
    },
    {
      title: 'Showcase',
      content: 'Et excepteur nulla ad cupidatat.',
      image: '/media/media-4.jpg',
    },
    {
      title: 'Parts & Accessories',
      content: 'Adipisicing dolor ullamco.',
      image: '/media/media-4.jpg',
    },
  ];
};
export const media = [media1, media2, media3, media4, media5];
export const cards = [card1, card2, card3, card4];
export const cardBottoms = [card5, card6, card7, card8];
export const cardBottomsByIndex = (index) => cardBottoms[index % cards.length];
export const cardByIndex = (index) => cards[index % cards.length];
export const mediaByIndex = (index) => media[index % media.length];
