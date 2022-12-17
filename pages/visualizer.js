import styles from '@/styles/Visualizer.module.scss';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

export async function x3DLoad() {
  return await import('x3dom');
}

export default function Visualizer() {
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();
  let myX3d;
  let sceneRef = useRef();

  useEffect(() => {
    x3DLoad().then(() => {
      setTimeout(() => {
        setShowContent(true);
        refresh();
        x3dom.reload();
      }, 1000);
    });
  }, []);

  const refresh = () => {
    const x3dEl = document.getElementById('X3DElement');
    console.log('x3dEl', x3dEl);

    setTimeout(() => {
      sceneRef ? sceneRef.current.setAttribute('render', 'true') : null;
      sceneRef ? sceneRef.current.setAttribute('reload', 'true') : null;
    }, 2000);
  };

  return (
    <div className={styles.visualizerWrapper}>
      <div className={styles.visualizer}>
        <x3d is="x3d" ref={sceneRef} id="X3DElement">
          {/* {showContent && ( */}
          <scene is="x3d" id="X3DElement_scene">
            <inline
              is="x3d"
              nameSpaceName="myScene"
              mapDEFToID="true"
              url="https://prismic-io.s3.amazonaws.com/compleat/2dfd2e49-a4c1-4b8d-af92-170af1d64a0d_3dspiral.x3d"
            ></inline>
          </scene>
          {/* )} */}
        </x3d>
      </div>
    </div>
  );
}
