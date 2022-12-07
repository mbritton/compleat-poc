import styles from '@/styles/Visualizer.module.scss';
import { useEffect, useState } from 'react';

export async function x3DLoad() {
  return await import('x3dom');
}

export default function Visualizer() {
  const [showCover, setShowCover] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      x3DLoad().then((x3d) => {
        console.log('done', x3d);
      });
    }, 1000);
  }, []);

  return (
    <div className={styles.visualizerWrapper}>
      <div className={styles.visualizer}>
        <x3d is="x3d" width="620" height="620">
          <scene is="x3d">
            <inline
              is="x3d"
              nameSpaceName="myScene"
              mapDEFToID="false"
              url="https://prismic-io.s3.amazonaws.com/compleat/5a879a6d-c070-4515-84f2-c896981ecc98_3dspiral.x3d"
            ></inline>
          </scene>
        </x3d>
      </div>
      <div className={styles.cover} onClick={() => setShowCover(false)}></div>
    </div>
  );
}
