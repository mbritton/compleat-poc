import styles from '@/styles/Woods.module.scss';
import Image from 'next/image';
import { BiBrushAlt } from 'react-icons/bi';
import {
  blackTexture,
  red_oak_texture,
  whiteTexture,
  white_oak_texture,
  yellow_pine_texture,
} from './textures_woods';

const Woods = ({ handleWoodPress, handleBrushPress, selectedTexture }) => {
  return (
    <div className={styles.woodsWrapper}>
      <div className={styles.wood}>
        <Image
          onClick={() => handleWoodPress('white')}
          objectFit="cover"
          objectPosition="top left"
          src={whiteTexture}
          width={80}
          height={80}
          alt="black"
        />
      </div>
      <div className={styles.wood}>
        <Image
          onClick={() => handleWoodPress('black')}
          objectFit="cover"
          objectPosition="top left"
          src={blackTexture}
          width={80}
          height={80}
          alt="black"
        />
      </div>
      <div className={styles.wood}>
        <Image
          onClick={() => handleWoodPress('red-oak')}
          objectFit="cover"
          objectPosition="top left"
          src={red_oak_texture}
          width={80}
          height={80}
          alt="red oak"
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
          alt="white oak"
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
          alt="yellow pine"
        />
      </div>
      {/* <div className={styles.brushWrapper} onClick={() => handleBrushPress()}>
        <BiBrushAlt />
      </div> */}
    </div>
  );
};

export default Woods;
