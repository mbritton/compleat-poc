/* eslint-disable react-hooks/exhaustive-deps */
import styles from '@/styles/Visualizer2.module.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { x3dLoader, x3dParser } from 'three-x3d-loader';
import * as renderX3D from '@/utils/renderX3D.js';

export default function Visualizer2() {
  let scene;
  const [data, setData] = useState();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  let renderer = new THREE.WebGLRenderer();
  // const uri3D =
  //   'https://prismic-io.s3.amazonaws.com/compleat/58837d5a-6963-475d-88f6-9ece2c1fa486_3dspiral.x3d';
  const uri3D = 'media/3dspiral.x3d';
  const mountRef = useRef();

  const fetcher = async (url) => res;

  const parse = (xmlData) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
    console.log('xmlDoc', xmlDoc);

    setTimeout(() => {
      renderX3D(THREE, xmlDoc, scene, true);
    }, 1000);
  };

  const loadModel = async (xmlData) => {
    let loader = new THREE.FileLoader(THREE.DefaultLoadingManager);
    loader.load(
      uri3D,
      (text) => {
        // this.scene.add(parse3D(text))
        // console.log('text', text);
        parse(text);
      },
      (ref) => {
        // console.log('LOADING', ref);
      },
      () => {},
    );
  };

  // const parseModel = (threeVar, xmlData) => {
  //   console.log('PARSEMODEL', xmlData);
  //   const x3d = x3dParser(THREE, xmlData.value);
  //   return x3d;
  // };

  // if (data !== undefined) {
  //   console.log('XML DATA', data);
  //   // const xmlData = parseModel(THREE, data);
  // }

  const onWindowResize = useCallback((camera, renderer) => {
    const { clientWidth, clientHeight } = mountRef.current;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer?.setSize(clientWidth, clientHeight);
  }, []);

  const loadModel2 = async (uintVar) => {
    const loader = new FBXLoader();

    const group = loader.parse(uintVar.blob, '');
    scene.add(group);

    reader.readAsArrayBuffer(blob);
  };

  useEffect(() => {
    scene = new THREE.Scene();

    const { clientWidth, clientHeight } = mountRef.current;
    const camera = new THREE.PerspectiveCamera(
      75,
      clientWidth / clientHeight,
      0.1,
      1000,
    );

    renderer.setSize(clientWidth, clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    window.addEventListener(
      'resize',
      () => {
        onWindowResize(camera, renderer);
      },
      false,
    );

    onWindowResize(camera, renderer);
    // scene && data && THREE ? x3dParser(THREE, data, scene, material) : null;

    return () => {
      mountRef && mountRef.current
        ? mountRef.current.removeChild(renderer.domElement)
        : null;
    };
  }, []);

  useEffect(() => {
    loadModel(uri3D);
  }, []);

  return (
    <div className={styles.visualizerWrapper}>
      <div className={styles.visualizer}>
        <div className={styles.visualizerThree} ref={mountRef}></div>
      </div>
    </div>
  );
}
