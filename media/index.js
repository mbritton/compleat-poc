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
      title: 'Card 1',
      content: 'Adipisicing dolor ullamco incididunt aute esse.',
      image: '',
    },
    {
      title: 'Card 2',
      content: 'Ut non sit eu enim ut nisi.',
      image: '',
    },
    {
      title: 'Card 3',
      content: 'Et excepteur nulla ad cupidatat.',
      image: '',
    },
    {
      title: 'Card 4',
      content: 'Adipisicing dolor ullamco.',
      image: '',
    },
  ];
};

export const media = [media1, media2, media3, media4, media5];
export const mediaByIndex = (index) => media[index % media.length];
