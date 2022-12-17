// Home page bottom cards, top row
import card1 from './images/bottom_cards_00.jpg';
import card2 from './images/bottom_cards_01.jpg';
import card3 from './images/bottom_cards_02.jpg';
import card4 from './images/bottom_cards_03.jpg';
// Home page bottom cards, bottom row
import card7 from './images/media-13.jpg';
// Embla carousel images
import media1 from './images/media-1.jpg';
import media2 from './images/media-2.jpg';
import media3 from './images/media-3.jpg';
import media4 from './images/media-4.jpg';
// Stair Types images
import stairType1 from './images/stairType-1.jpg';
import stairType2 from './images/stairType-2.jpg';
import stairType3 from './images/stairType-3.jpg';
import stairType4 from './images/stairType-4.jpg';
import stairType5 from './images/stairType-5.jpg';
import stairType6 from './images/stairType-6.jpg';
import stairType7 from './images/stairType-7.jpg';
// Product tests
import productTest1 from './images/product-test-horiz.png';
import productTest2 from './images/product-test-vert.png';
import productTest3 from './images/product-test-horiz.png';
import productTest4 from './images/product-test-vert.png';
import productTest5 from './images/product-test-horiz.png';
import productTest6 from './images/product-test-vert.png';
import productTest7 from './images/product-test-horiz.png';
import productTest8 from './images/product-test-vert.png';
import productTest9 from './images/product-test-horiz.png';
import productTest10 from './images/product-test-vert.png';
import productTest11 from './images/product-test-horiz.png';
import productTest12 from './images/product-test-vert.png';

export const stairTypeTitles = [
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

export const getFeatured = (index) => {
  const titles = [
    {
      title: 'The Complete Stair System',
      content:
        'Consequat consectetur dolor consectetur eiusmod. Cupidatat quis est mollit sit qui ex fugiat laborum in in officia. Reprehenderit sint amet laboris sint. Cupidatat eiusmod consectetur est incididunt. Esse velit adipisicing enim proident ex eiusmod duis culpa adipisicing..',
      inset: {
        title: 'Holiday House',
        content: 'Sit irure excepteur cillum occaecat et veniam commodo.',
        src: 'https://images.prismic.io/compleat/2b54c62d-17dc-401f-8df8-f85fbf0fb6ba_right-overlay-inset-1.jpg',
      },
    },
    {
      title: 'Slide Title 2',
      content:
        'Excepteur nostrud aliquip exercitation quis proident occaecat ullamco.',
      inset: {
        title: 'Inset Title 2',
        content: 'Inset Content 2 Exercitation id reprehenderit ad occaecat.',
        src: 'https://images.prismic.io/compleat/81d2bcbb-d658-4b18-a42d-5d4d18a0d1b3_right-overlay-inset-2.jpg',
      },
    },
    {
      title: 'Next Slide Title',
      content:
        'Mollit in irure anim excepteur nostrud eu minim do minim enim aliqua.',
      inset: {
        title: 'Inset Title 3',
        content: 'Inset Content 3',
        src: 'https://images.prismic.io/compleat/2b54c62d-17dc-401f-8df8-f85fbf0fb6ba_right-overlay-inset-1.jpg',
      },
    },
    {
      title: 'Next Slide Title 2',
      content: 'Sint consequat cillum sunt voluptate incididunt irure velit.',
      inset: {
        title: 'Inset Title 4',
        content: 'Inset Content 4',
        src: 'https://images.prismic.io/compleat/2b54c62d-17dc-401f-8df8-f85fbf0fb6ba_right-overlay-inset-1.jpg',
      },
    },
    {
      title: 'Next Slide Title 3',
      content:
        'Sit sunt exercitation quis officia elit dolor do voluptate consequat.',
      inset: {
        title: 'Inset Title 5',
        content: 'Inset Content 5',
        src: 'https://images.prismic.io/compleat/2b54c62d-17dc-401f-8df8-f85fbf0fb6ba_right-overlay-inset-1.jpg',
      },
    },
  ];
  return titles[index];
};

export const getCards = () => {
  return [
    {
      title: 'Modern System',
      content:
        'Adipisicing dolor ullamco incididunt aute esse. Proident cupidatat cillum cupidatat <a href="http://www.mikebritton.com">iusmod proident >></a>',
    },
    {
      title: 'Craftsman',
      content:
        'Adipisicing dolor ullamco incididunt aute esse. Proident cupidatat cillum cupidatat <a href="http://www.mikebritton.com">iusmod proident >></a>',
    },
    {
      title: 'Showcase',
      content:
        'Adipisicing dolor ullamco incididunt aute esse. Proident cupidatat cillum cupidatat <a href="http://www.mikebritton.com">iusmod proident >></a>',
    },
    {
      title: 'Parts & Accessories',
      content:
        'Adipisicing dolor ullamco incidt cillum cupidatat <a href="/products">iusmod proident >></a>',
    },
  ];
};

export const media = [media3, media4, media1, media2];
export const cards = [card1, card2, card3, card4];
export const cardBottoms = [card7, card7, card7, card7];
export const stairTypes = [
  stairType1,
  stairType2,
  stairType3,
  stairType4,
  stairType5,
  stairType6,
  stairType7,
];

export const productTests = [
  productTest1,
  productTest2,
  productTest3,
  productTest4,
  productTest5,
  productTest6,
  productTest7,
  productTest8,
  productTest9,
  productTest10,
  productTest11,
  productTest12,
];

// const rightOverlayIndexes = [inset1, inset2, inset3, inset4, inset5];
export const cardBottomsByIndex = (index) => cardBottoms[index % cards.length];
export const cardByIndex = (index) => cards[index % cards.length];
export const mediaByIndex = (index) => media[index % media.length];
export const stairTypesByIndex = (index) =>
  stairTypes[index % stairTypes.length];
// export const rightOverlayInsetsByIndex = (index) =>
//   rightOverlayIndexes[index % rightOverlayIndexes.length];
