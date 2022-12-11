/* eslint-disable react-hooks/exhaustive-deps */
import styles from '@/styles/Visualizer2.module.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { x3dLoader, x3dParser } from 'three-x3d-loader';
import { renderX3D } from '@/utils/renderX3D';
import { Scene, Canvas } from 'react-three-fiber';

export default function Visualizer2() {
  const mountRef = useRef();
  let scene = new THREE.Scene();
  const [data, setData] = useState();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  let renderer = new THREE.WebGLRenderer();
  const { clientWidth, clientHeight } = useState(mountRef.current);
  const camera = new THREE.PerspectiveCamera(75, clientWidth / 1200, 1, 1000);
  const uri3D =
    'https://prismic-io.s3.amazonaws.com/compleat/0faa9e99-bb84-4409-9dc5-93978912c290_3dspiral.x3d';

  const convertModel = (xmlString) => {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, 'text/xml');
  };

  const loadModel = useCallback(async (xmlData) => {
    let loader = new THREE.FileLoader(THREE.DefaultLoadingManager);
    await loader.load(
      xmlData,
      (text) => {
        // Get it as an XML object
        const myObj = convertModel(text);
        console.log('scene', scene);
        () => renderX3D(THREE, myObj, scene, material);

        // x3dom.reload();
      },
      () => {
        console.log('progress');
      },
      (e) => {
        console.log('error', e);
      },
    );
  }, []);

  const onWindowResize = useCallback((camera, renderer) => {
    camera = !camera
      ? new THREE.PerspectiveCamera(75, clientWidth / 1200, 1, 1000)
      : null;

    camera.aspect = clientWidth / 1200;
    camera.lookAt(scene.position);
    camera.updateProjectionMatrix();
    renderer?.setSize(clientWidth, clientHeight);
  }, []);

  // const loadModel2 = async (uintVar) => {
  //   const loader = new FBXLoader();

  //   const group = loader.parse(uintVar.blob, '');
  //   scene.add(group);

  //   reader.readAsArrayBuffer(blob);
  // };

  useEffect(() => {
    const { clientWidth, clientHeight } = mountRef.current;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();

    // renderer.setSize(clientWidth, 1200);
    mountRef.current.appendChild(renderer.domElement);

    console.log('mountRef', mountRef.current);
    console.log('renderer.domElement', renderer.domElement);

    // scene.add(mountRef.current);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: '#433F81' });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    return () => {
      mountRef && mountRef.current
        ? mountRef.current.removeChild(renderer.domElement)
        : console.log('no mountRef');
    };
  }, []);

  useEffect(() => {
    onWindowResize();
    // x3dLoader(THREE);
    loadModel(uri3D);
  }, []);

  return (
    <div className={styles.visualizerWrapper}>
      <div className={styles.visualizer}>
        <div ref={mountRef}></div>
        {/* <Scene camera={camera} scene={scene} renderer={renderer} /> */}
      </div>
    </div>
  );
}
