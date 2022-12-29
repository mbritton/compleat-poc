import styles from '@/styles/Woods.module.scss';
import { BiEnvelope, BiHelpCircle, BiBrushAlt } from 'react-icons/bi';
import Image from 'next/image';
import {
  red_oak_texture,
  white_oak_texture,
  yellow_pine_texture,
} from './textures_woods';

const Woods = ({ handleWoodPress, selectedTexture }) => {
  return (
    <div className={styles.woodsWrapper}>
      {/* <div className={styles.woodsPositioner}> */}
      <div className={styles.wood}>
        <Image
          onClick={() => handleWoodPress('red-oak')}
          objectFit="cover"
          objectPosition="top left"
          src={red_oak_texture}
          width={80}
          height={80}
          alt="card"
        />
      </div>
      <div className={styles.wood}>
        <Image
          onClick={() => handleWoodPress('white-oak')}
          objectFit="cover"
          objectPosition="top left"
          src={white_oak_texture}
          width={80}
          height={80}
          alt="card"
        />
      </div>
      <div className={styles.wood}>
        <Image
          onClick={() => handleWoodPress('yellow-pine')}
          objectFit="cover"
          objectPosition="top left"
          src={yellow_pine_texture}
          width={80}
          height={80}
          alt="card"
        />
      </div>
      {/* </div> */}
      <div className={styles.brushWrapper}>
        <BiBrushAlt />
      </div>
    </div>
  );
};

export default Woods;
