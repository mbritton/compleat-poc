import styles from '@/styles/Visualizer2.module.scss';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { x3dLoader, x3dParser } from 'three-x3d-loader';
import useSWR from 'swr';

const fetcher = (url) =>
  fetch(url).then((res) => {
    return res;
  });

export default function Visualizer2() {
  const mountRef = useRef(null);
  const { data, error } = useSWR(
    'https://prismic-io.s3.amazonaws.com/compleat/8ea368f1-d682-4709-aca2-0f5bd7b2e2ff_3dspiral.x3d',
    fetcher,
  );

  console.log('data', data);

  // if (error) return <div>failed to load</div>;
  // // TODO: Loading component with timing and state transitions for user
  // if (!xmlData) return <div>loading...</div>;

  const onWindowResize = (camera, renderer) => {
    const { clientWidth, clientHeight } = mountRef.current;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer?.setSize(clientWidth, clientHeight);
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(620, 620);
    mountRef.current.appendChild(renderer.domElement);
    window.addEventListener(
      'resize',
      () => onWindowResize(camera, renderer),
      false,
    );

    console.log('data', data);
    console.log('error', error);
    console.log('THREE', THREE);
    console.log('scene', scene);

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    // scene && data && THREE ? x3dParser(THREE, data, scene, material) : null;
    scene && data && THREE ? data.x3dParser(THREE, data, scene) : null;

    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    // camera.position.z = 5;

    // const animate = () => {
    //   requestAnimationFrame(animate);

    //   cube.rotation.x += 0.01;
    //   cube.rotation.y += 0.01;

    //   renderer.render(scene, camera);
    // };

    // animate();

    // onWindowResize(camera, renderer);

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);
  return (
    <div className={styles.visualizerWrapper}>
      <div className={styles.visualizer}>
        <div className={styles.visualizerThree} ref={mountRef}></div>
      </div>
    </div>
  );
}
