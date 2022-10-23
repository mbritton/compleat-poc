import media1 from './media-1.jpeg';
import media2 from './media-2.jpeg';
import media3 from './media-3.jpeg';
import media4 from './media-4.jpeg';
import media5 from './media-5.jpeg';

export const getSlideContent = (index) => {
  const titles = [
    { title: 'foo', content: 'Excepteur Lorem ipsum non occaecat.' },
    {
      title: 'bar',
      content:
        'Excepteur nostrud aliquip exercitation quis proident occaecat ullamco.',
    },
    {
      title: 'baz',
      content:
        'Mollit in irure anim excepteur nostrud eu minim do minim enim aliqua.',
    },
    {
      title: 'buzz',
      content: 'Sint consequat cillum sunt voluptate incididunt irure velit.',
    },
    {
      title: 'boz',
      content:
        'Sit sunt exercitation quis officia elit dolor do voluptate consequat.',
    },
  ];
  return titles[index];
};

export const media = [media1, media2, media3, media4, media5];
export const mediaByIndex = (index) => media[index % media.length];
