import styles from '@/styles/Woods.module.scss';
import { BiEnvelope, BiHelpCircle, BiBrushAlt } from 'react-icons/bi';
import Image from 'next/image';

const Woods = ({ path, pageObjects }) => {
  return (
    <div className={styles.woodsWrapper}>
      <div className={styles.wood}>
        <Image
          objectFit="cover"
          objectPosition="top left"
          src={
            'https://images.prismic.io/compleat/556ae943-28ec-4f43-8ffc-b66ee287eeb8_red-oak.jpg?auto=compress,format'
          }
          width={154}
          height={182}
          alt="card"
        />
      </div>
      <div className={styles.wood}>
        <Image
          objectFit="cover"
          objectPosition="top left"
          src={
            'https://images.prismic.io/compleat/e6ffc913-3b54-4289-8b9e-55b581eb40f6_white-oak.jpeg?auto=compress,format'
          }
          width={154}
          height={182}
          alt="card"
        />
      </div>
      <div className={styles.wood}>
        <Image
          objectFit="cover"
          objectPosition="top left"
          src={
            'https://images.prismic.io/compleat/1a6b9068-8304-4ae5-acd8-dffb81ac07c0_yellow-pine.jpeg?auto=compress,format'
          }
          width={154}
          height={182}
          alt="card"
        />
      </div>
      <div className={styles.brushWrapper}>
        <BiBrushAlt />
      </div>
    </div>
  );
};

export default Woods;
