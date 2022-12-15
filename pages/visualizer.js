import styles from '@/styles/Visualizer.module.scss';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BiExpandAlt } from 'react-icons/bi';

export async function x3DLoad() {
  return await import('x3dom');
}

export default function Visualizer() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      x3DLoad().then((x3d) => {
        setShowContent(true);
        x3dom.reload();
      });
    }, 1000);
  }, []);

  const handleClick = useCallback((e, path) => {
    if (path === '/about') {
      console.log('I clicked');
    }
    if (path === '/posts') {
      console.log('I clicked');
    }
  }, []);

  return (
    <div className={styles.visualizerWrapper}>
      <div className={styles.visualizer}>
        {/* <Link href="/visualizer3">
          <BiExpandAlt
            className={styles.expand}
            onClick={(e) => handleClick(e, '/visualizer3')}
          />
        </Link> */}
        {showContent && (
          <x3d is="x3d">
            <scene is="x3d">
              <navigationInfo is="x3d" type="turntable"></navigationInfo>
              <inline
                is="x3d"
                nameSpaceName="myScene"
                mapDEFToID="false"
                contentType="model/x3d+xml"
                url="https://prismic-io.s3.amazonaws.com/compleat/af5b1872-1a8b-4264-9893-e0c7cf384b5f_3dspiral.x3d"
              ></inline>
            </scene>
          </x3d>
        )}
      </div>
      {/* <div className={styles.cover} onClick={() => setShowCover(false)}></div> */}
    </div>
  );
}
