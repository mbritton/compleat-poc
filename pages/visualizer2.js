/* eslint-disable react-hooks/exhaustive-deps */
import styles from '@/styles/Visualizer2.module.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { x3dLoader, x3dParser } from 'three-x3d-loader';
import * as renderX3D from '@/utils/renderX3D';
import { Object3D } from 'three';
import { parse } from 'path';

THREE.Cache.enabled = true;

export default function Visualizer2() {
  let mountRef = useRef();
  const clientWidth = window.innerWidth;
  const clientHeight = 1000;
  const scene = new THREE.Scene();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const renderer = new THREE.WebGLRenderer();
  let ambientLight;
  const camera = new THREE.PerspectiveCamera(
    75,
    clientWidth / clientHeight,
    1,
    1000,
  );
  let xmlDOM;
  const uri3D =
    'https://prismic-io.s3.amazonaws.com/compleat/aa5b53fb-91f9-4aa8-9ab7-e40beac0e77e_3dspiral-position-000.x3d';

  const parseModel = useCallback(async () => {
    let loader = new THREE.FileLoader(THREE.DefaultLoadingManager);
    loader.setResponseType('text');
    const parser = new DOMParser();
    await loader.load(
      uri3D,
      (text) => {
        const foo = parser.parseFromString(text, 'text/xml');
        renderModel(foo);
      },
      (progress) => {
        console.log('progress', progress);
      },
    );
  }, []);

  const renderModel = useCallback((foo) => {
    console.log('renderModel', foo);

    scene.background = new THREE.Color(0xf2f5ff);

    ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);

    const light = new THREE.HemisphereLight(0x404040, 0xffffff, 1);
    scene.add(light);

    camera.position.z = -30;
    camera.position.x = 1;
    camera.position.y = 0;
    camera.aspect = clientWidth / clientHeight;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: '#433F81' });
    let cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    renderer.render(scene, camera);
  }, []);

  const loadModel = useCallback(async (xmlData) => {
    await parseModel().then((xmlDOMRet) => {
      // console.log('xmlDOMRet', xmlDOMRet);
      // xmlDOM = parser.parseFromString(text, 'text/xml');
      // const xmlDomObj = parseModel(xmlDOM);
      // renderX3D(THREE, xmlDOMRet, scene, material);
      // renderer.render(scene, camera);
      // scene.background = new THREE.Color(0xf2f5ff);
      // ambientLight = new THREE.AmbientLight(0x404040); // soft white light
      // scene.add(ambientLight);
      // const light = new THREE.HemisphereLight(0x404040, 0xffffff, 1);
      // scene.add(light);
      // camera.position.z = -30;
      // camera.position.x = 1;
      // camera.position.y = 0;
      // camera.aspect = clientWidth / clientHeight;
      // camera.lookAt(new THREE.Vector3(0, 0, 0));
      // camera.updateProjectionMatrix();
      // const geometry = new THREE.BoxGeometry(1, 1, 1);
      // const material = new THREE.MeshBasicMaterial({ color: '#433F81' });
      // let cube = new THREE.Mesh(geometry, material);
      // scene.add(cube);
    });
  }, []);

  const onWindowResize = useCallback(() => {
    renderer.setSize(clientWidth, clientHeight);
  }, [clientWidth, clientHeight]);

  useEffect(() => {
    mountRef.current.appendChild(renderer.domElement);

    loadModel(uri3D).then(() => {
      onWindowResize();
      // setTimeout(() => {
      //   // renderX3D(THREE, xmlDOM, scene, material);
      //   // renderer.render(scene, camera);
      // }, 1000);
    });

    return () => {
      mountRef && mountRef.current
        ? mountRef.current.removeChild(renderer.domElement)
        : console.log('no mountRef');
    };
  }, []);

  return (
    <div className={styles.visualizerWrapper}>
      <div className={styles.visualizer} ref={mountRef}>
        <div ref={mountRef}></div>
      </div>
    </div>
  );
}
