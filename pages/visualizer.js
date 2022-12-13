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
        x3dom.reload();
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
              url="https://prismic-io.s3.amazonaws.com/compleat/a70a27f2-b285-4970-9cda-5514d1b8f580_3dspiral.x3d"
            ></inline>
          </scene>
        </x3d>
      </div>
      <div className={styles.cover} onClick={() => setShowCover(false)}></div>
    </div>
  );
}
