import styles from '@/styles/Visualizer.module.scss';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { BiExpandAlt } from 'react-icons/bi';

export async function x3DLoad() {
  return await import('x3dom');
}

export default function Visualizer() {
  const [showContent, setShowContent] = useState(false);
  const { router } = useRouter();

  useEffect(() => {
    setTimeout(() => {
      x3DLoad().then((x3d) => {
        console.log('x3d', x3d);
        setShowContent(true);
        console.log('x3dom', x3dom);
        x3dom.reload();
      });
    }, 1000);
  }, []);

  const handleClick = useCallback((e, path) => {
    router.push(path);
  }, []);

  return (
    <div className={styles.visualizerWrapper}>
      <div className={styles.visualizer}>
        <BiExpandAlt
          className={styles.expand}
          onClick={(e) => handleClick(e, '/visualizer3')}
        />
        {showContent && (
          <x3d is="x3d">
            <scene is="x3d">
              <inline
                is="x3d"
                nameSpaceName="myScene"
                mapDEFToID="true"
                url="https://prismic-io.s3.amazonaws.com/compleat/2dfd2e49-a4c1-4b8d-af92-170af1d64a0d_3dspiral.x3d"
              ></inline>
            </scene>
          </x3d>
        )}
      </div>
      {/* <div className={styles.cover} onClick={() => setShowCover(false)}></div> */}
    </div>
  );
}
