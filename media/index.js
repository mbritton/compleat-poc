// All branding goes here
import logo from './logo-white-text.png'; 
import logoSmall from './logo-black-text-sm.png'; 
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
// Stair Types images
import stairType1 from './stairType-1.jpg';
import stairType2 from './stairType-2.jpg';
import stairType3 from './stairType-3.jpg';
import stairType4 from './stairType-4.jpg';
import stairType5 from './stairType-5.jpg';
import stairType6 from './stairType-6.jpg';
import stairType7 from './stairType-7.jpg';

export const getStairTypeSlides = (index) => {
  const titles = [
    {
      title: 'Curve',
      content: 'Excepteur Lorem ipsum non occaecat.',
    },
    {
      title: 'Spiral',
      content:
        'Excepteur nostrud aliquip exercitation quis proident occaecat ullamco.',
    },
    {
      title: 'Box',
      content:
        'Mollit in irure anim excepteur nostrud eu minim do minim enim aliqua.',
    },
    {
      title: 'Box with Knee Wall',
      content:
        'Consectetur mollit reprehenderit deserunt velit nostrud nostrud voluptate exercitation.',
    },
    {
      title: 'Double Open Tread',
      content: 'Dolore nulla laborum exercitation commodo sunt.',
    },
    {
      title: 'Flare',
      content:
        'Sit sunt exercitation quis officia elit dolor do voluptate consequat.',
    },
    {
      title: 'Double Open Riser / Open Stringer',
      content:
        'Voluptate amet ea duis eiusmod nulla et anim cillum duis eiusmod fugiat quis officia deserunt.',
    },
  ];
  return titles[index];
};

export const getSlides = (index) => {
  const titles = [
    {
      title: 'The Complete Stair System',
      content: 'Excepteur Lorem ipsum non occaecat.',
    },
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
    },
    {
      title: 'Craftsman',
      content: 'Ut non sit eu enim ut nisi.',
    },
    {
      title: 'Showcase',
      content: 'Et excepteur nulla ad cupidatat.',
    },
    {
      title: 'Parts & Accessories',
      content: 'Adipisicing dolor ullamco.',
    },
  ];
};

export const media = [media1, media2, media3, media4, media5];
export const cards = [card1, card2, card3, card4];
export const cardBottoms = [card5, card6, card7, card8];
export const stairTypes = [
  stairType1,
  stairType2,
  stairType3,
  stairType4,
  stairType5,
  stairType6,
  stairType7,
];
export const cardBottomsByIndex = (index) => cardBottoms[index % cards.length];
export const cardByIndex = (index) => cards[index % cards.length];
export const mediaByIndex = (index) => media[index % media.length];
export const stairTypesByIndex = (index) => stairTypes[index % stairTypes.length];
export const brandingLogo = logo;
export const brandingLogoSmall = logoSmall;
