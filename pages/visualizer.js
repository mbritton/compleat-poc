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
        // x3d.DefaultX3D().refresh();
      });
    }, 4000);
  }, []);

  return (
    <div className={styles.visualizerWrapper}>
      <div className={styles.visualizer}>
        <x3d is="x3d" width="100%" height="100%">
          <scene is="x3d" width="100%" height="100%">
            <inline
              is="x3d"
              nameSpaceName="myScene"
              mapDEFToID="false"
              url="https://prismic-io.s3.amazonaws.com/compleat/8ea368f1-d682-4709-aca2-0f5bd7b2e2ff_3dspiral.x3d"
            ></inline>
          </scene>
        </x3d>
      </div>
    </div>
  );
}
