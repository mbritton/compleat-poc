import styles from '@/styles/Visualizer.module.scss';
import { useMemo } from 'react';

export async function x3LoadEvents(event, params) {
  return await import('x3dom');
}

export default function Visualizer() {
  useMemo(() => {
    x3LoadEvents();
  }, []);

  return (
    <div className={styles.visualizerWrapper}>
      <div className={styles.visualizer}>
        <x3d is="x3d" width="100%" height="100%">
          <scene is="x3d">
            <inline
              is="x3d"
              nameSpaceName="myScene"
              mapDEFToID="true"
              url="https://prismic-io.s3.amazonaws.com/compleat/8ea368f1-d682-4709-aca2-0f5bd7b2e2ff_3dspiral.x3d"
            ></inline>
          </scene>
        </x3d>
      </div>
    </div>
  );
}
