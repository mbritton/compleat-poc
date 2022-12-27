import styles from '@/styles/Visualizer3.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Woods from '@/components/Woods';

export async function x3DLoad() {
  return await import('x3dom');
}

const transitionType = 'FLY';
const allTextures =
  'wallTex, ceilingTex, floorTex, treadTex, handrailTex, postTex, stringTex, wellTex';
const targetTextureIds =
  '#treadTex, #handrailTex, #postTex, #stringTex, #wellTex, #floorTex, #wellTex, #ceilingTex, #wallTex';
const default_texture =
  'https://images.prismic.io/compleat/79d4f6c1-1407-42dd-80a8-2a2e9898f2f2_1d08b162-0c61-43db-9d9c-6591102d7d7f.jpeg';
const dark_texture =
  'https://images.prismic.io/compleat/01d8b279-01a4-4eb1-947a-d9e44ad41be6_1d08b162-0c61-43db-9d9c-6591102d7d7f_DARK.jpg';

export default function Visualizer3() {
  const [showContent, setShowContent] = useState(true);

  let elemRef = useRef();
  let leftMatrix;

  const [currentFloorTexture, setCurrentFloorTexture] =
    useState(default_texture);

  // TODO: Add a state for the handrail texture
  const [currentSelectedTexture, setCurrentSelectedTexture] =
    useState(dark_texture);

  const [currentElement, setCurrentElement] = useState();

  const switchCamera = useCallback((viewpointId) => {
    document.getElementById(viewpointId).setAttribute('set_bind', 'true');
  }, []);

  const switchWood = useCallback((woodType) => {}, []);

  const onNextPrev = useCallback(
    (typeOfCall) => {
      typeOfCall === 'next'
        ? currentElement.current.runtime.nextView()
        : currentElement.current.runtime.prevView();
    },
    [currentElement],
  );

  const parseShapes = useCallback(() => {
    const sceneEl = document.getElementById('X3DElement_scene');
    const shapes = sceneEl.getElementsByTagName('shape');

    for (let i = 0; i < shapes.length; i++) {
      shapes[i].addEventListener('click', handleShapeClick);
    }
  }, [handleShapeClick]);

  const handleShapeClick = useCallback((e) => {
    const shape = e.target;
    const appearance = shape.getElementsByTagName('appearance')[0];
    const textureNeeded = appearance
      ? appearance.getElementsByTagName('texture')[0].getAttribute('use')
      : null;
    const targetTexture =
      textureNeeded && textureNeeded.length
        ? document.getElementById(textureNeeded)
        : null;

    if (!targetTexture) return;

    const currentURL = targetTexture.getAttribute('url');
    targetTexture.setAttribute(
      'url',
      currentURL === default_texture ? dark_texture : default_texture,
    );
  }, []);

  const setMatrix = useCallback(() => {
    leftMatrix = currentElement.current.runtime.viewMatrix();
  }, [leftMatrix, currentElement]);

  /**
   * @description WIP - Not working correctly
   */
  const applyMatrixTransformation = useCallback(() => {
    const axisR = elemRef.current.runtime
      .getActiveBindable('viewpoint')
      .getAttribute('orientation');

    let orientationArray = axisR.split(' ').map((x) => {
      return x ? parseFloat(x) : 0;
    });

    let transformMatrix = new x3dom.fields.SFMatrix4f(
      orientationArray[0] ? orientationArray[0] : 0,
      orientationArray[1] ? orientationArray[1] : 0,
      orientationArray[2] ? orientationArray[2] : 0,
      orientationArray[3] ? orientationArray[3] : 0,
      orientationArray[4] ? orientationArray[4] : 0,
      orientationArray[5] ? orientationArray[5] : 0,
      orientationArray[6] ? orientationArray[6] : 0,
      orientationArray[7] ? orientationArray[7] : 0,
      orientationArray[8] ? orientationArray[8] : 0,
      orientationArray[9] ? orientationArray[9] : 0,
      orientationArray[10] ? orientationArray[10] : 0,
      orientationArray[11] ? orientationArray[11] : 0,
      orientationArray[12] ? orientationArray[12] : 0,
      orientationArray[13] ? orientationArray[13] : 0,
      orientationArray[14] ? orientationArray[14] : 0,
      orientationArray[15] ? orientationArray[15] : 0,
    );

    let orientationQuat = new x3dom.fields.Quaternion(0, 1, 0, 0);
    orientationQuat.setValue(transformMatrix);
    orientationQuat.toAxisAngle(new x3dom.fields.SFVec3f(0, 1, 0), Math.PI / 2);
    transformMatrix = orientationQuat.toMatrix();

    orientationArray = transformMatrix.toGL();

    let orientation =
      orientationArray[0] +
      ' ' +
      orientationArray[1] +
      ' ' +
      orientationArray[2] +
      ' ' +
      orientationArray[3] +
      ' ' +
      orientationArray[4] +
      ' ' +
      orientationArray[5] +
      ' ' +
      orientationArray[6] +
      ' ' +
      orientationArray[7] +
      ' ' +
      orientationArray[8] +
      ' ' +
      orientationArray[9] +
      ' ' +
      orientationArray[10] +
      ' ' +
      orientationArray[11] +
      ' ' +
      orientationArray[12] +
      ' ' +
      orientationArray[13] +
      ' ' +
      orientationArray[14] +
      ' ' +
      orientationArray[15];

    elemRef.current.runtime
      .getActiveBindable('viewpoint')
      .setAttribute('orientation', orientation);
    elemRef.current.runtime
      .getActiveBindable('viewpoint')
      .setAttribute('position', '0 0 400');
  }, []);

  const setGlobalTexture = useCallback(() => {
    currentFloorTexture =
      currentFloorTexture === dark_texture ? default_texture : dark_texture;
  }, [default_texture, dark_texture]);

  const swapTexture = useCallback(() => {
    const targetTextures = document.querySelectorAll(targetTextureIds);

    setGlobalTexture();

    targetTextures.forEach((textItem) => {
      textItem.setAttribute('url', currentFloorTexture);
      textItem.setAttribute('repeatS', true);
      textItem.setAttribute('repeatT', true);
    });
  }, [currentFloorTexture, setGlobalTexture]);

  useEffect(() => {
    elemRef ? setCurrentElement(elemRef) : null;
    setCurrentFloorTexture(default_texture);

    x3DLoad().then((x3d) => {
      // X3DOM prototype hack to update texture on the fly
      x3dom.Texture.prototype.update = function () {
        if (x3dom.isa(this.node, x3dom.nodeTypes.Text)) {
          this.updateText();
        } else {
          this.updateTexture();
        }
      };
      setShowContent(true);
      setCurrentSelectedTexture(currentFloorTexture);
      parseShapes();
      x3dom ? x3dom.reload() : null;
    });
  }, []);

  return (
    <>
      <div className={styles.controlsWrapper}>
        <div className={styles.controlsContainer}>
          <div className={styles.control} onClick={() => onNextPrev()}>
            Previous
          </div>
          <div
            className={styles.control}
            onClick={() => elemRef.current.runtime.showAll()}
          >
            Reset
          </div>
          <div
            className={styles.control}
            onClick={() => switchCamera('front_cam')}
          >
            Front
          </div>
          <div
            className={styles.control}
            onClick={() => switchCamera('rear_cam')}
          >
            Rear
          </div>
          {/* <div className={styles.control} onClick={() => setMatrix()}>
            Set Matrix
          </div>
          <div className={styles.control} onClick={() => applyMatrix()}>
            Apply Matrix
          </div> */}
          <div className={styles.control} onClick={() => swapTexture()}>
            Swap Texture
          </div>
          <div className={styles.control} onClick={() => onNextPrev()}>
            Next
          </div>
        </div>
      </div>
      <Woods></Woods>
      <div className={styles.visualizerWrapper}>
        <x3d
          ref={elemRef}
          is="x3d"
          id="X3DElement"
          x="0px"
          y="0px"
          showlog="false"
          showstat="false"
          profile="Immersive"
          version="3.3"
        >
          {showContent && (
            <scene
              is="x3d"
              id="X3DElement_scene"
              render="true"
              visible="true"
              bboxcenter="0,0,0"
              bboxsize="-1,-1,-1"
              pickmode="idBuf"
              dopickpass="true"
            >
              <viewpoint
                is="x3d"
                id="persp_cam"
                DEF="CA_Camera"
                description="persp_cam"
                centerofrotation="0 0 0"
                orientation="0.105124 0.94807 0.300188 3.78271"
                position="-368.414 332.496 -450.739"
                fieldOfView="0.785398"
                znear="-1"
                zfar="-1"
              ></viewpoint>
              <viewpoint
                is="x3d"
                id="rear_cam"
                DEF="CA_Camera"
                description="rear_cam"
                orientation="0.996843 -0.079223 -0.00522 6.15119"
                position="0 0 500"
                centerofrotation="0 0 0"
                fieldOfView="0.785398"
                znear="-1"
                zfar="-1"
              ></viewpoint>
              <viewpoint
                is="x3d"
                id="front_cam"
                DEF="CA_Camera"
                description="front_cam"
                orientation="0.000296 2.5 0.169683 3.14503"
                position="0 0 -500"
                centerofrotation="0 0 0"
                fieldofview="0.785398"
                znear="-1"
                zfar="-1"
              ></viewpoint>
              <viewpoint
                is="x3d"
                id="left_cam"
                DEF="CA_Camera"
                description="left_cam"
                centerofrotation="0 0 0"
                orientation="0 2 0 3.3"
                position="0 0 -400"
                fieldOfView="0.785398"
              ></viewpoint>
              <navigationinfo
                is="x3d"
                type="'FLY'"
                typeparams="-0.4,60,0.05,2.8"
                explorationmode="all"
                avatarsize="0.25,1.6,0.75"
                speed="1"
                transitiontime="0.5"
                transitiontype="'LINEAR'"
              ></navigationinfo>
              <timesensor
                is="x3d"
                DEF="time"
                cycleInterval="1"
                loop="true"
              ></timesensor>
              <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                <texture
                  is="x3d"
                  id="treadTex"
                  def="treadTex"
                  url="https://images.prismic.io/compleat/79d4f6c1-1407-42dd-80a8-2a2e9898f2f2_1d08b162-0c61-43db-9d9c-6591102d7d7f.jpeg"
                  repeats="true"
                  repeatt="true"
                  hidechildren="true"
                ></texture>
                <material
                  is="x3d"
                  def="treadMat"
                  id="treadMat"
                  diffusecolor="0.01 0.01 0.01"
                  transparency="0"
                  ambientintensity="0.2"
                  emissivecolor="0,0,0"
                  shininess="0.2"
                  specularcolor="0,0,0"
                ></material>
                <texture
                  is="x3d"
                  def="handrailTex"
                  id="handrailTex"
                  url="https://images.prismic.io/compleat/79d4f6c1-1407-42dd-80a8-2a2e9898f2f2_1d08b162-0c61-43db-9d9c-6591102d7d7f.jpeg"
                  repeats="true"
                  repeatt="true"
                  hidechildren="true"
                ></texture>
                <material
                  is="x3d"
                  def="handrailMat"
                  id="handrailMat"
                  diffusecolor="1 1 1"
                  transparency="0"
                  ambientintensity="0.2"
                  emissivecolor="0,0,0"
                  shininess="0.2"
                  specularcolor="0,0,0"
                ></material>
                <texture
                  is="x3d"
                  def="handrailTexDark"
                  id="handrailTexDark"
                  url="https://images.prismic.io/compleat/01d8b279-01a4-4eb1-947a-d9e44ad41be6_1d08b162-0c61-43db-9d9c-6591102d7d7f_DARK.jpg"
                  repeats="true"
                  repeatt="true"
                  hidechildren="true"
                ></texture>
                <material
                  is="x3d"
                  def="handrailMatDark"
                  id="handrailMatDark"
                  diffusecolor="1 1 1"
                  transparency="0"
                  ambientintensity="0.2"
                  emissivecolor="0,0,0"
                  shininess="0.6"
                  specularcolor="0,0,0"
                ></material>
                <texture
                  is="x3d"
                  id="stringTex"
                  def="stringTex"
                  url="https://images.prismic.io/compleat/79d4f6c1-1407-42dd-80a8-2a2e9898f2f2_1d08b162-0c61-43db-9d9c-6591102d7d7f.jpeg"
                  repeats="true"
                  repeatt="true"
                  hidechildren="true"
                ></texture>
                <material
                  is="x3d"
                  def="stringMat"
                  id="stringMat"
                  diffusecolor="0.01 0.01 0.01"
                  transparency="0"
                  ambientintensity="0.2"
                  emissivecolor="0,0,0"
                  shininess="0.2"
                  specularcolor="0,0,0"
                ></material>
                <texture
                  is="x3d"
                  id="postTex"
                  def="postTex"
                  url="https://images.prismic.io/compleat/79d4f6c1-1407-42dd-80a8-2a2e9898f2f2_1d08b162-0c61-43db-9d9c-6591102d7d7f.jpeg"
                  repeats="true"
                  repeatt="true"
                  hidechildren="true"
                ></texture>
                <material
                  is="x3d"
                  id="postMat"
                  def="postMat"
                  diffusecolor="1 1 1"
                  transparency="0"
                  ambientintensity="0.2"
                  emissivecolor="0,0,0"
                  shininess="0.2"
                  specularcolor="0,0,0"
                ></material>
                <texture
                  is="x3d"
                  id="floorTex"
                  def="floorTex"
                  url="https://images.prismic.io/compleat/79d4f6c1-1407-42dd-80a8-2a2e9898f2f2_1d08b162-0c61-43db-9d9c-6591102d7d7f.jpeg"
                  repeats="true"
                  repeatt="true"
                  hidechildren="true"
                ></texture>
                <material
                  is="x3d"
                  id="floorMat"
                  def="floorMat"
                  diffusecolor="1 1 1"
                  transparency="0"
                  ambientintensity="0.2"
                  emissivecolor="0,0,0"
                  shininess="0.2"
                  specularcolor="0,0,0"
                ></material>
                <texture
                  is="x3d"
                  id="balusterTex"
                  def="balusterTex"
                  repeats="true"
                  repeatt="true"
                  hidechildren="true"
                ></texture>
                <material
                  is="x3d"
                  def="balusterMat"
                  id="balusterMat"
                  diffusecolor="0.01 0.01 0.01"
                  transparency="0"
                  ambientintensity="0.2"
                  emissivecolor="0,0,0"
                  shininess="0.2"
                  specularcolor="0,0,0"
                ></material>
                <texture
                  is="x3d"
                  id="wellTex"
                  def="wellTex"
                  url="https://images.prismic.io/compleat/79d4f6c1-1407-42dd-80a8-2a2e9898f2f2_1d08b162-0c61-43db-9d9c-6591102d7d7f.jpeg"
                  repeats="true"
                  repeatt="true"
                  hidechildren="false"
                ></texture>
                <material
                  is="x3d"
                  def="wellMat"
                  id="wellMat"
                  diffusecolor="1 1 1"
                  transparency="0.7"
                  ambientintensity="0.2"
                  emissivecolor="0,0,0"
                  shininess="0.2"
                  specularcolor="0,0,0"
                ></material>
              </appearance>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 35 34 1 -1 1 34 33 2 -1 2 33 32 3 -1 3 32 31 4 -1 
4 31 30 5 -1 5 30 29 6 -1 6 29 28 7 -1 7 28 27 8 -1 
8 27 26 9 -1 9 26 25 10 -1 10 25 24 11 -1 11 24 23 12 -1 
12 23 22 13 -1 13 22 21 14 -1 14 21 20 15 -1 15 20 19 16 -1 
16 19 18 17 -1 17 18 35 0 -1 23 24 25 -1 25 22 23 -1 
25 21 22 -1 25 20 21 -1 25 26 27 28 19 20 -1 31 32 33 34 35 18 -1 
18 19 28 29 30 31 -1 3 4 5 6 7 8 9 10 11 12 -1 17 0 1 -1 1 16 17 -1 
1 15 16 -1 1 14 15 -1 1 13 14 -1 1 2 3 12 13 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 -1 75 76 77 -1 
78 79 80 -1 81 82 83 -1 84 85 86 87 88 89 -1 90 91 92 93 94 95 -1 
96 97 98 99 100 101 -1 102 103 104 105 106 107 108 109 110 111 -1 112 113 114 -1 115 116 117 -1 
118 119 120 -1 121 122 123 -1 124 125 126 -1 127 128 129 130 131 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 2.8 -170.08 -6.53 13.67 -170.08 -74.24 8.53 -170.08 -74.89 3.36 -170.08 -75.19
 -1.82 -170.08 -75.13 -6.99 -170.08 -74.72 -12.11 -170.08 -73.97 -17.18 -170.08 -72.86
 -22.15 -170.08 -71.42 -27.02 -170.08 -69.63 -31.75 -170.08 -67.53 -5.95 -170.08 -0.07
 -5.52 -170.08 -1.74 -4.72 -170.08 -3.28 -3.6 -170.08 -4.59 -2.21 -170.08 -5.61
 -0.62 -170.08 -6.3 1.08 -170.08 -6.61 1.08 -174.53 -6.61 -0.62 -174.53 -6.3
 -2.21 -174.53 -5.61 -3.6 -174.53 -4.59 -4.72 -174.53 -3.28 -5.52 -174.53 -1.74
 -5.95 -174.53 -0.07 -31.75 -174.53 -67.53 -27.02 -174.53 -69.63 -22.15 -174.53 -71.42
 -17.18 -174.53 -72.86 -12.11 -174.53 -73.97 -6.99 -174.53 -74.72 -1.82 -174.53 -75.13
 3.36 -174.53 -75.19 8.53 -174.53 -74.89 13.67 -174.53 -74.24 2.8 -174.53 -6.53
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -5.8 0 -7.07 1.15 -7.07 1.15 -5.8 1.15 -5.8 1.15 -7.07 1.23 -7.07 1.23 -5.8 1.23 -5.8 1.23 -7.07 1.32 -7.07 1.32 -5.8 1.32 -5.8 1.32 -7.07 1.41 -7.07 1.41 -5.8 
1.41 -5.8 1.41 -7.07 1.49 -7.07 1.49 -5.8 1.49 -5.8 1.49 -7.07 1.58 -7.07 1.58 -5.8 1.58 -5.8 1.58 -7.07 1.67 -7.07 1.67 -5.8 1.67 -5.8 1.67 -7.07 1.75 -7.07 1.75 -5.8 
1.75 -5.8 1.75 -7.07 1.84 -7.07 1.84 -5.8 1.84 -5.8 1.84 -7.07 1.93 -7.07 1.93 -5.8 1.93 -5.8 1.93 -7.07 3.13 -7.07 3.13 -5.8 3.13 -5.8 3.13 -7.07 3.16 -7.07 3.16 -5.8 
3.16 -5.8 3.16 -7.07 3.19 -7.07 3.19 -5.8 3.19 -5.8 3.19 -7.07 3.22 -7.07 3.22 -5.8 3.22 -5.8 3.22 -7.07 3.24 -7.07 3.24 -5.8 3.24 -5.8 3.24 -7.07 3.27 -7.07 3.27 -5.8 
3.27 -5.8 3.27 -7.07 3.3 -7.07 3.3 -5.8 3.3 -5.8 3.3 -7.07 3.33 -7.07 3.33 -5.8 -0.17 0.18 -0.2 0.18 0.84 -0.73 0.84 -0.73 -0.14 0.2 -0.17 0.18 
0.84 -0.73 -0.12 0.22 -0.14 0.2 0.84 -0.73 -0.1 0.25 -0.12 0.22 0.84 -0.73 0.89 -0.62 0.93 -0.5 0.97 -0.39 -0.08 0.29 -0.1 0.25 1.05 -0.02 1.06 0.11 1.07 0.24 1.07 0.37 -0.07 0.37 -0.07 0.33 
-0.07 0.33 -0.08 0.29 0.97 -0.39 1 -0.27 1.03 -0.14 1.05 -0.02 1.06 -0.1 1.05 0.03 1.03 0.15 1 0.28 0.97 0.4 0.93 0.51 0.89 0.63 0.84 0.74 -0.2 -0.17 -0.17 -0.17 -0.07 -0.32 -0.07 -0.36 1.07 -0.36 1.07 -0.36 -0.08 -0.28 -0.07 -0.32 
1.07 -0.36 -0.1 -0.24 -0.08 -0.28 1.07 -0.36 -0.12 -0.21 -0.1 -0.24 1.07 -0.36 -0.14 -0.19 -0.12 -0.21 1.07 -0.36 1.07 -0.23 1.06 -0.1 -0.17 -0.17 -0.14 -0.19
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 35 34 1 -1 1 34 33 2 -1 2 33 32 3 -1 3 32 31 4 -1 
4 31 30 5 -1 5 30 29 6 -1 6 29 28 7 -1 7 28 27 8 -1 
8 27 26 9 -1 9 26 25 10 -1 10 25 24 11 -1 11 24 23 12 -1 
12 23 22 13 -1 13 22 21 14 -1 14 21 20 15 -1 15 20 19 16 -1 
16 19 18 17 -1 17 18 35 0 -1 23 24 25 -1 25 22 23 -1 
25 21 22 -1 25 20 21 -1 25 26 27 28 19 20 -1 31 32 33 34 35 18 -1 
18 19 28 29 30 31 -1 3 4 5 6 7 8 9 10 11 12 -1 17 0 1 -1 1 16 17 -1 
1 15 16 -1 1 14 15 -1 1 13 14 -1 1 2 3 12 13 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 -1 75 76 77 -1 
78 79 80 -1 81 82 83 -1 84 85 86 87 88 89 -1 90 91 92 93 94 95 -1 
96 97 98 99 100 101 -1 102 103 104 105 106 107 108 109 110 111 -1 112 113 114 -1 115 116 117 -1 
118 119 120 -1 121 122 123 -1 124 125 126 -1 127 128 129 130 131 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -1.13 -147.42 -6.13 -25.63 -147.42 -70.18 -30.37 -147.42 -68.18 -34.97 -147.42 -65.87
 -39.39 -147.42 -63.25 -43.64 -147.42 -60.33 -47.67 -147.42 -57.14 -51.48 -147.42 -53.68
 -55.05 -147.42 -49.98 -58.37 -147.42 -46.04 -61.4 -147.42 -41.88 -5.68 -147.42 3.27
 -6 -147.42 1.66 -5.97 -147.42 0.02 -5.58 -147.42 -1.57 -4.87 -147.42 -3.05
 -3.86 -147.42 -4.34 -2.59 -147.42 -5.38 -2.59 -151.86 -5.38 -3.86 -151.86 -4.34
 -4.87 -151.86 -3.05 -5.58 -151.86 -1.57 -5.97 -151.86 0.02 -6 -151.86 1.66
 -5.68 -151.86 3.27 -61.4 -151.86 -41.88 -58.37 -151.86 -46.04 -55.05 -151.86 -49.98
 -51.48 -151.86 -53.68 -47.67 -151.86 -57.14 -43.64 -151.86 -60.33 -39.39 -151.86 -63.25
 -34.97 -151.86 -65.87 -30.37 -151.86 -68.18 -25.63 -151.86 -70.18 -1.13 -151.86 -6.13
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -14.27 0 -15.54 1.15 -15.54 1.15 -14.27 1.15 -14.27 1.15 -15.54 1.23 -15.54 1.23 -14.27 1.23 -14.27 1.23 -15.54 1.32 -15.54 1.32 -14.27 1.32 -14.27 1.32 -15.54 1.41 -15.54 1.41 -14.27 
1.41 -14.27 1.41 -15.54 1.49 -15.54 1.49 -14.27 1.49 -14.27 1.49 -15.54 1.58 -15.54 1.58 -14.27 1.58 -14.27 1.58 -15.54 1.66 -15.54 1.66 -14.27 1.66 -14.27 1.66 -15.54 1.75 -15.54 1.75 -14.27 
1.75 -14.27 1.75 -15.54 1.83 -15.54 1.83 -14.27 1.83 -14.27 1.83 -15.54 1.92 -15.54 1.92 -14.27 1.92 -14.27 1.92 -15.54 3.12 -15.54 3.12 -14.27 3.12 -14.27 3.12 -15.54 3.14 -15.54 3.14 -14.27 
3.14 -14.27 3.14 -15.54 3.17 -15.54 3.17 -14.27 3.17 -14.27 3.17 -15.54 3.2 -15.54 3.2 -14.27 3.2 -14.27 3.2 -15.54 3.22 -15.54 3.22 -14.27 3.22 -14.27 3.22 -15.54 3.25 -15.54 3.25 -14.27 
3.25 -14.27 3.25 -15.54 3.28 -15.54 3.28 -14.27 3.28 -14.27 3.28 -15.54 3.31 -15.54 3.31 -14.27 -1.02 0.96 -1.05 0.95 -0.02 0.05 -0.02 0.05 -1 0.97 -1.02 0.96 
-0.02 0.05 -0.98 0.99 -1 0.97 -0.02 0.05 -0.96 1.02 -0.98 0.99 -0.02 0.05 0.03 0.16 0.07 0.27 0.11 0.39 -0.94 1.06 -0.96 1.02 0.19 0.76 0.2 0.88 0.21 1.01 0.21 1.14 -0.93 1.14 -0.93 1.1 
-0.93 1.1 -0.94 1.06 0.11 0.39 0.14 0.51 0.17 0.63 0.19 0.76 0.2 -0.87 0.19 -0.75 0.17 -0.62 0.14 -0.5 0.11 -0.38 0.07 -0.26 0.03 -0.15 -0.02 -0.04 -1.05 -0.94 -1.02 -0.95 -0.93 -1.09 -0.93 -1.13 0.21 -1.13 0.21 -1.13 -0.94 -1.05 -0.93 -1.09 
0.21 -1.13 -0.96 -1.01 -0.94 -1.05 0.21 -1.13 -0.98 -0.98 -0.96 -1.01 0.21 -1.13 -1 -0.96 -0.98 -0.98 0.21 -1.13 0.21 -1 0.2 -0.87 -1.02 -0.95 -1 -0.96
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 35 34 1 -1 1 34 33 2 -1 2 33 32 3 -1 3 32 31 4 -1 
4 31 30 5 -1 5 30 29 6 -1 6 29 28 7 -1 7 28 27 8 -1 
8 27 26 9 -1 9 26 25 10 -1 10 25 24 11 -1 11 24 23 12 -1 
12 23 22 13 -1 13 22 21 14 -1 14 21 20 15 -1 15 20 19 16 -1 
16 19 18 17 -1 17 18 35 0 -1 23 24 25 -1 25 22 23 -1 
25 21 22 -1 25 20 21 -1 25 26 27 28 19 20 -1 31 32 33 34 35 18 -1 
18 19 28 29 30 31 -1 3 4 5 6 7 8 9 10 11 12 -1 17 0 1 -1 1 16 17 -1 
1 15 16 -1 1 14 15 -1 1 13 14 -1 1 2 3 12 13 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 -1 75 76 77 -1 
78 79 80 -1 81 82 83 -1 84 85 86 87 88 89 -1 90 91 92 93 94 95 -1 
96 97 98 99 100 101 -1 102 103 104 105 106 107 108 109 110 111 -1 112 113 114 -1 115 116 117 -1 
118 119 120 -1 121 122 123 -1 124 125 126 -1 127 128 129 130 131 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -4.33 -124.75 -3.81 -57.61 -124.75 -46.98 -60.73 -124.75 -42.85 -63.57 -124.75 -38.51
 -66.1 -124.75 -33.99 -68.32 -124.75 -29.31 -70.22 -124.75 -24.49 -71.79 -124.75 -19.55
 -73.01 -124.75 -14.51 -73.89 -124.75 -9.41 -74.43 -124.75 -4.25 -3.09 -124.75 7
 -4.32 -124.75 5.79 -5.25 -124.75 4.34 -5.83 -124.75 2.71 -6.03 -124.75 0.99
 -5.83 -124.75 -0.72 -5.26 -124.75 -2.35 -5.26 -129.2 -2.35 -5.83 -129.2 -0.72
 -6.03 -129.2 0.99 -5.83 -129.2 2.71 -5.25 -129.2 4.34 -4.32 -129.2 5.79
 -3.09 -129.2 7 -74.43 -129.2 -4.25 -73.89 -129.2 -9.41 -73.01 -129.2 -14.51
 -71.79 -129.2 -19.55 -70.22 -129.2 -24.49 -68.32 -129.2 -29.31 -66.1 -129.2 -33.99
 -63.57 -129.2 -38.51 -60.73 -129.2 -42.85 -57.61 -129.2 -46.98 -4.33 -129.2 -3.81
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -0.97 0 -2.24 1.15 -2.24 1.15 -0.97 1.15 -0.97 1.15 -2.24 1.23 -2.24 1.23 -0.97 1.23 -0.97 1.23 -2.24 1.32 -2.24 1.32 -0.97 1.32 -0.97 1.32 -2.24 1.41 -2.24 1.41 -0.97 
1.41 -0.97 1.41 -2.24 1.49 -2.24 1.49 -0.97 1.49 -0.97 1.49 -2.24 1.58 -2.24 1.58 -0.97 1.58 -0.97 1.58 -2.24 1.67 -2.24 1.67 -0.97 1.67 -0.97 1.67 -2.24 1.75 -2.24 1.75 -0.97 
1.75 -0.97 1.75 -2.24 1.84 -2.24 1.84 -0.97 1.84 -0.97 1.84 -2.24 1.93 -2.24 1.93 -0.97 1.93 -0.97 1.93 -2.24 3.13 -2.24 3.13 -0.97 3.13 -0.97 3.13 -2.24 3.16 -2.24 3.16 -0.97 
3.16 -0.97 3.16 -2.24 3.19 -2.24 3.19 -0.97 3.19 -0.97 3.19 -2.24 3.22 -2.24 3.22 -0.97 3.22 -0.97 3.22 -2.24 3.24 -2.24 3.24 -0.97 3.24 -0.97 3.24 -2.24 3.27 -2.24 3.27 -0.97 
3.27 -0.97 3.27 -2.24 3.3 -2.24 3.3 -0.97 3.3 -0.97 3.3 -2.24 3.33 -2.24 3.33 -0.97 -0.37 0.29 -0.4 0.28 0.65 -0.62 0.65 -0.62 -0.34 0.3 -0.37 0.29 
0.65 -0.62 -0.32 0.32 -0.34 0.3 0.65 -0.62 -0.29 0.35 -0.32 0.32 0.65 -0.62 0.69 -0.51 0.74 -0.4 0.77 -0.28 -0.28 0.39 -0.29 0.35 0.85 0.09 0.87 0.21 0.87 0.34 0.88 0.47 -0.27 0.47 -0.27 0.43 
-0.27 0.43 -0.28 0.39 0.77 -0.28 0.8 -0.16 0.83 -0.04 0.85 0.09 0.87 -0.2 0.85 -0.08 0.83 0.05 0.8 0.17 0.77 0.29 0.74 0.41 0.69 0.52 0.65 0.63 -0.4 -0.27 -0.37 -0.28 -0.27 -0.42 -0.27 -0.46 0.88 -0.46 0.88 -0.46 -0.28 -0.38 -0.27 -0.42 
0.88 -0.46 -0.29 -0.34 -0.28 -0.38 0.88 -0.46 -0.32 -0.31 -0.29 -0.34 0.88 -0.46 -0.34 -0.29 -0.32 -0.31 0.88 -0.46 0.87 -0.33 0.87 -0.2 -0.37 -0.28 -0.34 -0.29
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 35 34 1 -1 1 34 33 2 -1 2 33 32 3 -1 3 32 31 4 -1 
4 31 30 5 -1 5 30 29 6 -1 6 29 28 7 -1 7 28 27 8 -1 
8 27 26 9 -1 9 26 25 10 -1 10 25 24 11 -1 11 24 23 12 -1 
12 23 22 13 -1 13 22 21 14 -1 14 21 20 15 -1 15 20 19 16 -1 
16 19 18 17 -1 17 18 35 0 -1 23 24 25 -1 25 22 23 -1 
25 21 22 -1 25 20 21 -1 25 26 27 28 19 20 -1 31 32 33 34 35 18 -1 
18 19 28 29 30 31 -1 3 4 5 6 7 8 9 10 11 12 -1 17 0 1 -1 1 16 17 -1 
1 15 16 -1 1 14 15 -1 1 13 14 -1 1 2 3 12 13 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 -1 75 76 77 -1 
78 79 80 -1 81 82 83 -1 84 85 86 87 88 89 -1 90 91 92 93 94 95 -1 
96 97 98 99 100 101 -1 102 103 104 105 106 107 108 109 110 111 -1 112 113 114 -1 115 116 117 -1 
118 119 120 -1 121 122 123 -1 124 125 126 -1 127 128 129 130 131 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -5.93 -102.09 -0.2 -73.68 -102.09 -10.88 -74.31 -102.09 -5.74 -74.59 -102.09 -0.57
 -74.52 -102.09 4.61 -74.1 -102.09 9.78 -73.33 -102.09 14.9 -72.21 -102.09 19.96
 -70.75 -102.09 24.93 -68.95 -102.09 29.79 -66.83 -102.09 34.52 0.55 -102.09 8.54
 -1.12 -102.09 8.11 -2.66 -102.09 7.32 -3.97 -102.09 6.2 -5 -102.09 4.81
 -5.69 -102.09 3.23 -6.01 -102.09 1.53 -6.01 -106.53 1.53 -5.69 -106.53 3.23
 -5 -106.53 4.81 -3.97 -106.53 6.2 -2.66 -106.53 7.32 -1.12 -106.53 8.11
 0.55 -106.53 8.54 -66.83 -106.53 34.52 -68.95 -106.53 29.79 -70.75 -106.53 24.93
 -72.21 -106.53 19.96 -73.33 -106.53 14.9 -74.1 -106.53 9.78 -74.52 -106.53 4.61
 -74.59 -106.53 -0.57 -74.31 -106.53 -5.74 -73.68 -106.53 -10.88 -5.93 -106.53 -0.2
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -12.6 0 -13.87 1.15 -13.87 1.15 -12.6 1.15 -12.6 1.15 -13.87 1.23 -13.87 1.23 -12.6 1.23 -12.6 1.23 -13.87 1.32 -13.87 1.32 -12.6 1.32 -12.6 1.32 -13.87 1.41 -13.87 1.41 -12.6 
1.41 -12.6 1.41 -13.87 1.49 -13.87 1.49 -12.6 1.49 -12.6 1.49 -13.87 1.58 -13.87 1.58 -12.6 1.58 -12.6 1.58 -13.87 1.67 -13.87 1.67 -12.6 1.67 -12.6 1.67 -13.87 1.75 -13.87 1.75 -12.6 
1.75 -12.6 1.75 -13.87 1.84 -13.87 1.84 -12.6 1.84 -12.6 1.84 -13.87 1.93 -13.87 1.93 -12.6 1.93 -12.6 1.93 -13.87 3.13 -13.87 3.13 -12.6 3.13 -12.6 3.13 -13.87 3.16 -13.87 3.16 -12.6 
3.16 -12.6 3.16 -13.87 3.19 -13.87 3.19 -12.6 3.19 -12.6 3.19 -13.87 3.22 -13.87 3.22 -12.6 3.22 -12.6 3.22 -13.87 3.24 -13.87 3.24 -12.6 3.24 -12.6 3.24 -13.87 3.27 -13.87 3.27 -12.6 
3.27 -12.6 3.27 -13.87 3.3 -13.87 3.3 -12.6 3.3 -12.6 3.3 -13.87 3.33 -13.87 3.33 -12.6 -0.44 1.06 -0.47 1.06 0.57 0.15 0.57 0.15 -0.42 1.07 -0.44 1.06 
0.57 0.15 -0.39 1.1 -0.42 1.07 0.57 0.15 -0.37 1.13 -0.39 1.1 0.57 0.15 0.62 0.26 0.66 0.37 0.7 0.49 -0.36 1.16 -0.37 1.13 0.77 0.86 0.79 0.99 0.8 1.12 0.8 1.25 -0.34 1.25 -0.35 1.2 
-0.35 1.2 -0.36 1.16 0.7 0.49 0.73 0.61 0.75 0.73 0.77 0.86 0.79 -0.98 0.77 -0.85 0.75 -0.72 0.73 -0.6 0.7 -0.48 0.66 -0.36 0.62 -0.25 0.57 -0.14 -0.47 -1.05 -0.44 -1.05 -0.35 -1.19 -0.34 -1.24 0.8 -1.24 0.8 -1.24 -0.36 -1.15 -0.35 -1.19 
0.8 -1.24 -0.37 -1.12 -0.36 -1.15 0.8 -1.24 -0.39 -1.09 -0.37 -1.12 0.8 -1.24 -0.42 -1.06 -0.39 -1.09 0.8 -1.24 0.8 -1.11 0.79 -0.98 -0.44 -1.05 -0.42 -1.06
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 35 34 1 -1 1 34 33 2 -1 2 33 32 3 -1 3 32 31 4 -1 
4 31 30 5 -1 5 30 29 6 -1 6 29 28 7 -1 7 28 27 8 -1 
8 27 26 9 -1 9 26 25 10 -1 10 25 24 11 -1 11 24 23 12 -1 
12 23 22 13 -1 13 22 21 14 -1 14 21 20 15 -1 15 20 19 16 -1 
16 19 18 17 -1 17 18 35 0 -1 23 24 25 -1 25 22 23 -1 
25 21 22 -1 25 20 21 -1 25 26 27 28 19 20 -1 31 32 33 34 35 18 -1 
18 19 28 29 30 31 -1 3 4 5 6 7 8 9 10 11 12 -1 17 0 1 -1 1 16 17 -1 
1 15 16 -1 1 14 15 -1 1 13 14 -1 1 2 3 12 13 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 -1 75 76 77 -1 
78 79 80 -1 81 82 83 -1 84 85 86 87 88 89 -1 90 91 92 93 94 95 -1 
96 97 98 99 100 101 -1 102 103 104 105 106 107 108 109 110 111 -1 112 113 114 -1 115 116 117 -1 
118 119 120 -1 121 122 123 -1 124 125 126 -1 127 128 129 130 131 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -5.52 -79.42 3.73 -69.51 -79.42 28.41 -67.48 -79.42 33.17 -65.13 -79.42 37.79
 -62.48 -79.42 42.24 -59.52 -79.42 46.5 -56.29 -79.42 50.55 -52.79 -79.42 54.37
 -49.03 -79.42 57.94 -45.05 -79.42 61.25 -40.84 -79.42 64.28 4.47 -79.42 8.05
 2.81 -79.42 8.51 1.08 -79.42 8.59 -0.62 -79.42 8.28 -2.2 -79.42 7.6
 -3.59 -79.42 6.57 -4.72 -79.42 5.26 -4.72 -83.87 5.26 -3.59 -83.87 6.57
 -2.2 -83.87 7.6 -0.62 -83.87 8.28 1.08 -83.87 8.59 2.81 -83.87 8.51
 4.47 -83.87 8.05 -40.84 -83.87 64.28 -45.05 -83.87 61.25 -49.03 -83.87 57.94
 -52.79 -83.87 54.37 -56.29 -83.87 50.55 -59.52 -83.87 46.5 -62.48 -83.87 42.24
 -65.13 -83.87 37.79 -67.48 -83.87 33.17 -69.51 -83.87 28.41 -5.52 -83.87 3.73
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -4.29 0 -5.56 1.15 -5.56 1.15 -4.29 1.15 -4.29 1.15 -5.56 1.23 -5.56 1.23 -4.29 1.23 -4.29 1.23 -5.56 1.32 -5.56 1.32 -4.29 1.32 -4.29 1.32 -5.56 1.41 -5.56 1.41 -4.29 
1.41 -4.29 1.41 -5.56 1.49 -5.56 1.49 -4.29 1.49 -4.29 1.49 -5.56 1.58 -5.56 1.58 -4.29 1.58 -4.29 1.58 -5.56 1.67 -5.56 1.67 -4.29 1.67 -4.29 1.67 -5.56 1.75 -5.56 1.75 -4.29 
1.75 -4.29 1.75 -5.56 1.84 -5.56 1.84 -4.29 1.84 -4.29 1.84 -5.56 1.93 -5.56 1.93 -4.29 1.93 -4.29 1.93 -5.56 3.13 -5.56 3.13 -4.29 3.13 -4.29 3.13 -5.56 3.16 -5.56 3.16 -4.29 
3.16 -4.29 3.16 -5.56 3.19 -5.56 3.19 -4.29 3.19 -4.29 3.19 -5.56 3.22 -5.56 3.22 -4.29 3.22 -4.29 3.22 -5.56 3.24 -5.56 3.24 -4.29 3.24 -4.29 3.24 -5.56 3.27 -5.56 3.27 -4.29 
3.27 -4.29 3.27 -5.56 3.3 -5.56 3.3 -4.29 3.3 -4.29 3.3 -5.56 3.33 -5.56 3.33 -4.29 -0.79 0.99 -0.82 0.99 0.23 0.09 0.23 0.09 -0.76 1.01 -0.79 0.99 
0.23 0.09 -0.74 1.03 -0.76 1.01 0.23 0.09 -0.72 1.06 -0.74 1.03 0.23 0.09 0.27 0.19 0.31 0.31 0.35 0.43 -0.7 1.1 -0.72 1.06 0.43 0.8 0.44 0.92 0.45 1.05 0.46 1.18 -0.69 1.18 -0.69 1.14 
-0.69 1.14 -0.7 1.1 0.35 0.43 0.38 0.55 0.41 0.67 0.43 0.8 0.44 -0.91 0.43 -0.79 0.41 -0.66 0.38 -0.54 0.35 -0.42 0.31 -0.3 0.27 -0.19 0.23 -0.08 -0.82 -0.98 -0.79 -0.98 -0.69 -1.13 -0.69 -1.17 0.46 -1.17 0.46 -1.17 -0.7 -1.09 -0.69 -1.13 
0.46 -1.17 -0.72 -1.05 -0.7 -1.09 0.46 -1.17 -0.74 -1.02 -0.72 -1.05 0.46 -1.17 -0.76 -1 -0.74 -1.02 0.46 -1.17 0.45 -1.04 0.44 -0.91 -0.79 -0.98 -0.76 -1
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 35 34 1 -1 1 34 33 2 -1 2 33 32 3 -1 3 32 31 4 -1 
4 31 30 5 -1 5 30 29 6 -1 6 29 28 7 -1 7 28 27 8 -1 
8 27 26 9 -1 9 26 25 10 -1 10 25 24 11 -1 11 24 23 12 -1 
12 23 22 13 -1 13 22 21 14 -1 14 21 20 15 -1 15 20 19 16 -1 
16 19 18 17 -1 17 18 35 0 -1 23 24 25 -1 25 22 23 -1 
25 21 22 -1 25 20 21 -1 25 26 27 28 19 20 -1 31 32 33 34 35 18 -1 
18 19 28 29 30 31 -1 3 4 5 6 7 8 9 10 11 12 -1 17 0 1 -1 1 16 17 -1 
1 15 16 -1 1 14 15 -1 1 13 14 -1 1 2 3 12 13 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 -1 75 76 77 -1 
78 79 80 -1 81 82 83 -1 84 85 86 87 88 89 -1 90 91 92 93 94 95 -1 
96 97 98 99 100 101 -1 102 103 104 105 106 107 108 109 110 111 -1 112 113 114 -1 115 116 117 -1 
118 119 120 -1 121 122 123 -1 124 125 126 -1 127 128 129 130 131 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -3.19 -56.76 6.92 -46.22 -56.76 60.33 -42.08 -56.76 63.44 -37.73 -56.76 66.26
 -33.2 -56.76 68.78 -28.52 -56.76 70.99 -23.69 -56.76 72.88 -18.75 -56.76 74.43
 -13.71 -56.76 75.64 -8.6 -56.76 76.51 -3.44 -56.76 77.02 7.62 -56.76 5.66
 6.41 -56.76 6.89 4.96 -56.76 7.83 3.33 -56.76 8.41 1.62 -56.76 8.61
 -0.1 -56.76 8.42 -1.73 -56.76 7.85 -1.73 -61.2 7.85 -0.1 -61.2 8.42
 1.62 -61.2 8.61 3.33 -61.2 8.41 4.96 -61.2 7.83 6.41 -61.2 6.89
 7.62 -61.2 5.66 -3.44 -61.2 77.02 -8.6 -61.2 76.51 -13.71 -61.2 75.64
 -18.75 -61.2 74.43 -23.69 -61.2 72.88 -28.52 -61.2 70.99 -33.2 -61.2 68.78
 -37.73 -61.2 66.26 -42.08 -61.2 63.44 -46.22 -61.2 60.33 -3.19 -61.2 6.92
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -8.35 0 -9.62 1.15 -9.62 1.15 -8.35 1.15 -8.35 1.15 -9.62 1.23 -9.62 1.23 -8.35 1.23 -8.35 1.23 -9.62 1.32 -9.62 1.32 -8.35 1.32 -8.35 1.32 -9.62 1.41 -9.62 1.41 -8.35 
1.41 -8.35 1.41 -9.62 1.49 -9.62 1.49 -8.35 1.49 -8.35 1.49 -9.62 1.58 -9.62 1.58 -8.35 1.58 -8.35 1.58 -9.62 1.67 -9.62 1.67 -8.35 1.67 -8.35 1.67 -9.62 1.75 -9.62 1.75 -8.35 
1.75 -8.35 1.75 -9.62 1.84 -9.62 1.84 -8.35 1.84 -8.35 1.84 -9.62 1.93 -9.62 1.93 -8.35 1.93 -8.35 1.93 -9.62 3.13 -9.62 3.13 -8.35 3.13 -8.35 3.13 -9.62 3.16 -9.62 3.16 -8.35 
3.16 -8.35 3.16 -9.62 3.19 -9.62 3.19 -8.35 3.19 -8.35 3.19 -9.62 3.22 -9.62 3.22 -8.35 3.22 -8.35 3.22 -9.62 3.24 -9.62 3.24 -8.35 3.24 -8.35 3.24 -9.62 3.27 -9.62 3.27 -8.35 
3.27 -8.35 3.27 -9.62 3.3 -9.62 3.3 -8.35 3.3 -8.35 3.3 -9.62 3.33 -9.62 3.33 -8.35 -1.73 0.4 -1.76 0.39 -0.71 -0.51 -0.71 -0.51 -1.7 0.41 -1.73 0.4 
-0.71 -0.51 -1.68 0.43 -1.7 0.41 -0.71 -0.51 -1.65 0.46 -1.68 0.43 -0.71 -0.51 -0.67 -0.4 -0.62 -0.29 -0.59 -0.17 -1.64 0.5 -1.65 0.46 -0.51 0.2 -0.49 0.33 -0.49 0.45 -0.48 0.58 -1.63 0.58 -1.63 0.54 
-1.63 0.54 -1.64 0.5 -0.59 -0.17 -0.56 -0.05 -0.53 0.07 -0.51 0.2 -0.49 -0.32 -0.51 -0.19 -0.53 -0.06 -0.56 0.06 -0.59 0.18 -0.62 0.3 -0.67 0.41 -0.71 0.52 -1.76 -0.38 -1.73 -0.39 -1.63 -0.53 -1.63 -0.57 -0.48 -0.57 -0.48 -0.57 -1.64 -0.49 -1.63 -0.53 
-0.48 -0.57 -1.65 -0.45 -1.64 -0.49 -0.48 -0.57 -1.68 -0.42 -1.65 -0.45 -0.48 -0.57 -1.7 -0.4 -1.68 -0.42 -0.48 -0.57 -0.49 -0.44 -0.49 -0.32 -1.73 -0.39 -1.7 -0.4
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 35 34 1 -1 1 34 33 2 -1 2 33 32 3 -1 3 32 31 4 -1 
4 31 30 5 -1 5 30 29 6 -1 6 29 28 7 -1 7 28 27 8 -1 
8 27 26 9 -1 9 26 25 10 -1 10 25 24 11 -1 11 24 23 12 -1 
12 23 22 13 -1 13 22 21 14 -1 14 21 20 15 -1 15 20 19 16 -1 
16 19 18 17 -1 17 18 35 0 -1 23 24 25 -1 25 22 23 -1 
25 21 22 -1 25 20 21 -1 25 26 27 28 19 20 -1 31 32 33 34 35 18 -1 
18 19 28 29 30 31 -1 3 4 5 6 7 8 9 10 11 12 -1 17 0 1 -1 1 16 17 -1 
1 15 16 -1 1 14 15 -1 1 13 14 -1 1 2 3 12 13 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 -1 75 76 77 -1 
78 79 80 -1 81 82 83 -1 84 85 86 87 88 89 -1 90 91 92 93 94 95 -1 
96 97 98 99 100 101 -1 102 103 104 105 106 107 108 109 110 111 -1 112 113 114 -1 115 116 117 -1 
118 119 120 -1 121 122 123 -1 124 125 126 -1 127 128 129 130 131 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 0.43 -34.09 8.52 -10.08 -34.09 76.29 -4.93 -34.09 76.91 0.24 -34.09 77.18
 5.42 -34.09 77.1 10.59 -34.09 76.66 15.71 -34.09 75.87 20.76 -34.09 74.74
 25.73 -34.09 73.27 30.59 -34.09 71.46 35.31 -34.09 69.33 9.14 -34.09 2.01
 8.72 -34.09 3.69 7.93 -34.09 5.22 6.81 -34.09 6.54 5.43 -34.09 7.58
 3.85 -34.09 8.27 2.15 -34.09 8.59 2.15 -38.54 8.59 3.85 -38.54 8.27
 5.43 -38.54 7.58 6.81 -38.54 6.54 7.93 -38.54 5.22 8.72 -38.54 3.69
 9.14 -38.54 2.01 35.31 -38.54 69.33 30.59 -38.54 71.46 25.73 -38.54 73.27
 20.76 -38.54 74.74 15.71 -38.54 75.87 10.59 -38.54 76.66 5.42 -38.54 77.1
 0.24 -38.54 77.18 -4.93 -38.54 76.91 -10.08 -38.54 76.29 0.43 -38.54 8.52
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -12.5 0 -13.77 1.15 -13.77 1.15 -12.5 1.15 -12.5 1.15 -13.77 1.23 -13.77 1.23 -12.5 1.23 -12.5 1.23 -13.77 1.32 -13.77 1.32 -12.5 1.32 -12.5 1.32 -13.77 1.41 -13.77 1.41 -12.5 
1.41 -12.5 1.41 -13.77 1.49 -13.77 1.49 -12.5 1.49 -12.5 1.49 -13.77 1.58 -13.77 1.58 -12.5 1.58 -12.5 1.58 -13.77 1.67 -13.77 1.67 -12.5 1.67 -12.5 1.67 -13.77 1.75 -13.77 1.75 -12.5 
1.75 -12.5 1.75 -13.77 1.84 -13.77 1.84 -12.5 1.84 -12.5 1.84 -13.77 1.93 -13.77 1.93 -12.5 1.93 -12.5 1.93 -13.77 3.13 -13.77 3.13 -12.5 3.13 -12.5 3.13 -13.77 3.16 -13.77 3.16 -12.5 
3.16 -12.5 3.16 -13.77 3.19 -13.77 3.19 -12.5 3.19 -12.5 3.19 -13.77 3.22 -13.77 3.22 -12.5 3.22 -12.5 3.22 -13.77 3.24 -13.77 3.24 -12.5 3.24 -12.5 3.24 -13.77 3.27 -13.77 3.27 -12.5 
3.27 -12.5 3.27 -13.77 3.3 -13.77 3.3 -12.5 3.3 -12.5 3.3 -13.77 3.33 -13.77 3.33 -12.5 -1.11 0.46 -1.14 0.46 -0.1 -0.44 -0.1 -0.44 -1.09 0.48 -1.11 0.46 
-0.1 -0.44 -1.06 0.5 -1.09 0.48 -0.1 -0.44 -1.04 0.53 -1.06 0.5 -0.1 -0.44 -0.05 -0.33 -0.01 -0.22 0.03 -0.1 -1.03 0.57 -1.04 0.53 0.1 0.27 0.12 0.39 0.13 0.52 0.13 0.65 -1.01 0.65 -1.02 0.61 
-1.02 0.61 -1.03 0.57 0.03 -0.1 0.06 0.02 0.08 0.14 0.1 0.27 0.12 -0.38 0.1 -0.26 0.08 -0.13 0.06 -0.01 0.03 0.11 -0.01 0.23 -0.05 0.34 -0.1 0.45 -1.14 -0.45 -1.11 -0.46 -1.02 -0.6 -1.01 -0.64 0.13 -0.64 0.13 -0.64 -1.03 -0.56 -1.02 -0.6 
0.13 -0.64 -1.04 -0.52 -1.03 -0.56 0.13 -0.64 -1.06 -0.49 -1.04 -0.52 0.13 -0.64 -1.09 -0.47 -1.06 -0.49 0.13 -0.64 0.13 -0.51 0.12 -0.38 -1.11 -0.46 -1.09 -0.47
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 35 34 1 -1 1 34 33 2 -1 2 33 32 3 -1 3 32 31 4 -1 
4 31 30 5 -1 5 30 29 6 -1 6 29 28 7 -1 7 28 27 8 -1 
8 27 26 9 -1 9 26 25 10 -1 10 25 24 11 -1 11 24 23 12 -1 
12 23 22 13 -1 13 22 21 14 -1 14 21 20 15 -1 15 20 19 16 -1 
16 19 18 17 -1 17 18 35 0 -1 23 24 25 -1 25 22 23 -1 
25 21 22 -1 25 20 21 -1 25 26 27 28 19 20 -1 31 32 33 34 35 18 -1 
18 19 28 29 30 31 -1 3 4 5 6 7 8 9 10 11 12 -1 17 0 1 -1 1 16 17 -1 
1 15 16 -1 1 14 15 -1 1 13 14 -1 1 2 3 12 13 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 -1 75 76 77 -1 
78 79 80 -1 81 82 83 -1 84 85 86 87 88 89 -1 90 91 92 93 94 95 -1 
96 97 98 99 100 101 -1 102 103 104 105 106 107 108 109 110 111 -1 112 113 114 -1 115 116 117 -1 
118 119 120 -1 121 122 123 -1 124 125 126 -1 127 128 129 130 131 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 4.35 -11.43 8.09 29.2 -11.43 72.01 33.96 -11.43 69.97 38.58 -11.43 67.61
 43.02 -11.43 64.95 47.27 -11.43 61.98 51.31 -11.43 58.74 55.12 -11.43 55.23
 58.68 -11.43 51.46 61.98 -11.43 47.47 65 -11.43 43.25 8.64 -11.43 -1.9
 9.11 -11.43 -0.24 9.2 -11.43 1.48 8.89 -11.43 3.18 8.21 -11.43 4.77
 7.19 -11.43 6.16 5.88 -11.43 7.29 5.88 -15.87 7.29 7.19 -15.87 6.16
 8.21 -15.87 4.77 8.89 -15.87 3.18 9.2 -15.87 1.48 9.11 -15.87 -0.24
 8.64 -15.87 -1.9 65 -15.87 43.25 61.98 -15.87 47.47 58.68 -15.87 51.46
 55.12 -15.87 55.23 51.31 -15.87 58.74 47.27 -15.87 61.98 43.02 -15.87 64.95
 38.58 -15.87 67.61 33.96 -15.87 69.97 29.2 -15.87 72.01 4.35 -15.87 8.09
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -2.85 0 -4.12 1.15 -4.12 1.15 -2.85 1.15 -2.85 1.15 -4.12 1.23 -4.12 1.23 -2.85 1.23 -2.85 1.23 -4.12 1.32 -4.12 1.32 -2.85 1.32 -2.85 1.32 -4.12 1.41 -4.12 1.41 -2.85 
1.41 -2.85 1.41 -4.12 1.49 -4.12 1.49 -2.85 1.49 -2.85 1.49 -4.12 1.58 -4.12 1.58 -2.85 1.58 -2.85 1.58 -4.12 1.67 -4.12 1.67 -2.85 1.67 -2.85 1.67 -4.12 1.75 -4.12 1.75 -2.85 
1.75 -2.85 1.75 -4.12 1.84 -4.12 1.84 -2.85 1.84 -2.85 1.84 -4.12 1.93 -4.12 1.93 -2.85 1.93 -2.85 1.93 -4.12 3.13 -4.12 3.13 -2.85 3.13 -2.85 3.13 -4.12 3.16 -4.12 3.16 -2.85 
3.16 -2.85 3.16 -4.12 3.19 -4.12 3.19 -2.85 3.19 -2.85 3.19 -4.12 3.22 -4.12 3.22 -2.85 3.22 -2.85 3.22 -4.12 3.24 -4.12 3.24 -2.85 3.24 -2.85 3.24 -4.12 3.27 -4.12 3.27 -2.85 
3.27 -2.85 3.27 -4.12 3.3 -4.12 3.3 -2.85 3.3 -2.85 3.3 -4.12 3.33 -4.12 3.33 -2.85 -1.71 0.42 -1.74 0.41 -0.7 -0.49 -0.7 -0.49 -1.68 0.43 -1.71 0.42 
-0.7 -0.49 -1.66 0.45 -1.68 0.43 -0.7 -0.49 -1.64 0.48 -1.66 0.45 -0.7 -0.49 -0.65 -0.38 -0.61 -0.27 -0.57 -0.15 -1.62 0.52 -1.64 0.48 -0.49 0.22 -0.48 0.34 -0.47 0.47 -0.47 0.6 -1.61 0.6 -1.61 0.56 
-1.61 0.56 -1.62 0.52 -0.57 -0.15 -0.54 -0.03 -0.51 0.09 -0.49 0.22 -0.48 -0.33 -0.49 -0.21 -0.51 -0.08 -0.54 0.04 -0.57 0.16 -0.61 0.28 -0.65 0.39 -0.7 0.5 -1.74 -0.4 -1.71 -0.41 -1.61 -0.55 -1.61 -0.59 -0.47 -0.59 -0.47 -0.59 -1.62 -0.51 -1.61 -0.55 
-0.47 -0.59 -1.64 -0.47 -1.62 -0.51 -0.47 -0.59 -1.66 -0.44 -1.64 -0.47 -0.47 -0.59 -1.68 -0.42 -1.66 -0.44 -0.47 -0.59 -0.47 -0.46 -0.48 -0.33 -1.71 -0.41 -1.68 -0.42
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 35 34 1 -1 1 34 33 2 -1 2 33 32 3 -1 3 32 31 4 -1 
4 31 30 5 -1 5 30 29 6 -1 6 29 28 7 -1 7 28 27 8 -1 
8 27 26 9 -1 9 26 25 10 -1 10 25 24 11 -1 11 24 23 12 -1 
12 23 22 13 -1 13 22 21 14 -1 14 21 20 15 -1 15 20 19 16 -1 
16 19 18 17 -1 17 18 35 0 -1 23 24 25 -1 25 22 23 -1 
25 21 22 -1 25 20 21 -1 25 26 27 28 19 20 -1 31 32 33 34 35 18 -1 
18 19 28 29 30 31 -1 3 4 5 6 7 8 9 10 11 12 -1 17 0 1 -1 1 16 17 -1 
1 15 16 -1 1 14 15 -1 1 13 14 -1 1 2 3 12 13 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 -1 75 76 77 -1 
78 79 80 -1 81 82 83 -1 84 85 86 87 88 89 -1 90 91 92 93 94 95 -1 
96 97 98 99 100 101 -1 102 103 104 105 106 107 108 109 110 111 -1 112 113 114 -1 115 116 117 -1 
118 119 120 -1 121 122 123 -1 124 125 126 -1 127 128 129 130 131 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 7.54 11.24 5.76 61.06 11.24 48.64 64.16 11.24 44.49 66.97 11.24 40.14
 69.48 11.24 35.6 71.67 11.24 30.91 73.55 11.24 26.08 75.08 11.24 21.13
 76.28 11.24 16.09 77.14 11.24 10.98 77.64 11.24 5.82 6.24 11.24 -5.05
 7.48 11.24 -3.84 8.42 11.24 -2.39 9.01 11.24 -0.77 9.21 11.24 0.95
 9.03 11.24 2.66 8.46 11.24 4.29 8.46 6.79 4.29 9.03 6.79 2.66
 9.21 6.79 0.95 9.01 6.79 -0.77 8.42 6.79 -2.39 7.48 6.79 -3.84
 6.24 6.79 -5.05 77.64 6.79 5.82 77.14 6.79 10.98 76.28 6.79 16.09
 75.08 6.79 21.13 73.55 6.79 26.08 71.67 6.79 30.91 69.48 6.79 35.6
 66.97 6.79 40.14 64.16 6.79 44.49 61.06 6.79 48.64 7.54 6.79 5.76
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -14.28 0 -15.55 1.15 -15.55 1.15 -14.28 1.15 -14.28 1.15 -15.55 1.23 -15.55 1.23 -14.28 1.23 -14.28 1.23 -15.55 1.32 -15.55 1.32 -14.28 1.32 -14.28 1.32 -15.55 1.41 -15.55 1.41 -14.28 
1.41 -14.28 1.41 -15.55 1.49 -15.55 1.49 -14.28 1.49 -14.28 1.49 -15.55 1.58 -15.55 1.58 -14.28 1.58 -14.28 1.58 -15.55 1.67 -15.55 1.67 -14.28 1.67 -14.28 1.67 -15.55 1.75 -15.55 1.75 -14.28 
1.75 -14.28 1.75 -15.55 1.84 -15.55 1.84 -14.28 1.84 -14.28 1.84 -15.55 1.93 -15.55 1.93 -14.28 1.93 -14.28 1.93 -15.55 3.13 -15.55 3.13 -14.28 3.13 -14.28 3.13 -15.55 3.16 -15.55 3.16 -14.28 
3.16 -14.28 3.16 -15.55 3.19 -15.55 3.19 -14.28 3.19 -14.28 3.19 -15.55 3.22 -15.55 3.22 -14.28 3.22 -14.28 3.22 -15.55 3.24 -15.55 3.24 -14.28 3.24 -14.28 3.24 -15.55 3.27 -15.55 3.27 -14.28 
3.27 -14.28 3.27 -15.55 3.3 -15.55 3.3 -14.28 3.3 -14.28 3.3 -15.55 3.33 -15.55 3.33 -14.28 -1.66 0.53 -1.69 0.52 -0.64 -0.38 -0.64 -0.38 -1.63 0.54 -1.66 0.53 
-0.64 -0.38 -1.6 0.57 -1.63 0.54 -0.64 -0.38 -1.58 0.6 -1.6 0.57 -0.64 -0.38 -0.6 -0.27 -0.55 -0.16 -0.52 -0.04 -1.57 0.63 -1.58 0.6 -0.44 0.33 -0.42 0.46 -0.42 0.59 -0.41 0.72 -1.56 0.72 -1.56 0.67 
-1.56 0.67 -1.57 0.63 -0.52 -0.04 -0.49 0.08 -0.46 0.2 -0.44 0.33 -0.42 -0.45 -0.44 -0.32 -0.46 -0.19 -0.49 -0.07 -0.52 0.05 -0.55 0.17 -0.6 0.28 -0.64 0.39 -1.69 -0.52 -1.66 -0.52 -1.56 -0.66 -1.56 -0.71 -0.41 -0.71 -0.41 -0.71 -1.57 -0.62 -1.56 -0.66 
-0.41 -0.71 -1.58 -0.59 -1.57 -0.62 -0.41 -0.71 -1.6 -0.56 -1.58 -0.59 -0.41 -0.71 -1.63 -0.53 -1.6 -0.56 -0.41 -0.71 -0.42 -0.58 -0.42 -0.45 -1.66 -0.52 -1.63 -0.53
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 35 34 1 -1 1 34 33 2 -1 2 33 32 3 -1 3 32 31 4 -1 
4 31 30 5 -1 5 30 29 6 -1 6 29 28 7 -1 7 28 27 8 -1 
8 27 26 9 -1 9 26 25 10 -1 10 25 24 11 -1 11 24 23 12 -1 
12 23 22 13 -1 13 22 21 14 -1 14 21 20 15 -1 15 20 19 16 -1 
16 19 18 17 -1 17 18 35 0 -1 23 24 25 -1 25 22 23 -1 
25 21 22 -1 25 20 21 -1 25 26 27 28 19 20 -1 31 32 33 34 35 18 -1 
18 19 28 29 30 31 -1 3 4 5 6 7 8 9 10 11 12 -1 17 0 1 -1 1 16 17 -1 
1 15 16 -1 1 14 15 -1 1 13 14 -1 1 2 3 12 13 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 -1 75 76 77 -1 
78 79 80 -1 81 82 83 -1 84 85 86 87 88 89 -1 90 91 92 93 94 95 -1 
96 97 98 99 100 101 -1 102 103 104 105 106 107 108 109 110 111 -1 112 113 114 -1 115 116 117 -1 
118 119 120 -1 121 122 123 -1 124 125 126 -1 127 128 129 130 131 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 9.13 33.9 2.14 76.93 33.9 12.46 77.53 33.9 7.31 77.78 33.9 2.13
 77.69 33.9 -3.05 77.24 33.9 -8.21 76.44 33.9 -13.33 75.29 33.9 -18.38
 73.8 33.9 -23.35 71.98 33.9 -28.2 69.83 33.9 -32.91 2.59 33.9 -6.56
 4.27 33.9 -6.14 5.81 33.9 -5.36 7.13 33.9 -4.24 8.17 33.9 -2.86
 8.86 33.9 -1.28 9.19 33.9 0.41 9.19 29.45 0.41 8.86 29.45 -1.28
 8.17 29.45 -2.86 7.13 29.45 -4.24 5.81 29.45 -5.36 4.27 29.45 -6.14
 2.59 29.45 -6.56 69.83 29.45 -32.91 71.98 29.45 -28.2 73.8 29.45 -23.35
 75.29 29.45 -18.38 76.44 29.45 -13.33 77.24 29.45 -8.21 77.69 29.45 -3.05
 77.78 29.45 2.13 77.53 29.45 7.31 76.93 29.45 12.46 9.13 29.45 2.14
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -8.89 0 -10.16 1.15 -10.16 1.15 -8.89 1.15 -8.89 1.15 -10.16 1.23 -10.16 1.23 -8.89 1.23 -8.89 1.23 -10.16 1.32 -10.16 1.32 -8.89 1.32 -8.89 1.32 -10.16 1.41 -10.16 1.41 -8.89 
1.41 -8.89 1.41 -10.16 1.49 -10.16 1.49 -8.89 1.49 -8.89 1.49 -10.16 1.58 -10.16 1.58 -8.89 1.58 -8.89 1.58 -10.16 1.67 -10.16 1.67 -8.89 1.67 -8.89 1.67 -10.16 1.75 -10.16 1.75 -8.89 
1.75 -8.89 1.75 -10.16 1.84 -10.16 1.84 -8.89 1.84 -8.89 1.84 -10.16 1.93 -10.16 1.93 -8.89 1.93 -8.89 1.93 -10.16 3.13 -10.16 3.13 -8.89 3.13 -8.89 3.13 -10.16 3.16 -10.16 3.16 -8.89 
3.16 -8.89 3.16 -10.16 3.19 -10.16 3.19 -8.89 3.19 -8.89 3.19 -10.16 3.22 -10.16 3.22 -8.89 3.22 -8.89 3.22 -10.16 3.24 -10.16 3.24 -8.89 3.24 -8.89 3.24 -10.16 3.27 -10.16 3.27 -8.89 
3.27 -8.89 3.27 -10.16 3.3 -10.16 3.3 -8.89 3.3 -8.89 3.3 -10.16 3.33 -10.16 3.33 -8.89 -1.22 0.3 -1.25 0.3 -0.21 -0.61 -0.21 -0.61 -1.19 0.31 -1.22 0.3 
-0.21 -0.61 -1.17 0.34 -1.19 0.31 -0.21 -0.61 -1.15 0.37 -1.17 0.34 -0.21 -0.61 -0.16 -0.5 -0.12 -0.39 -0.08 -0.27 -1.13 0.4 -1.15 0.37 -0 0.1 0.01 0.23 0.02 0.36 0.02 0.49 -1.12 0.49 -1.12 0.44 
-1.12 0.44 -1.13 0.4 -0.08 -0.27 -0.05 -0.15 -0.02 -0.03 -0 0.1 0.01 -0.22 -0 -0.09 -0.02 0.04 -0.05 0.16 -0.08 0.28 -0.12 0.4 -0.16 0.51 -0.21 0.62 -1.25 -0.29 -1.22 -0.29 -1.12 -0.43 -1.12 -0.48 0.02 -0.48 0.02 -0.48 -1.13 -0.39 -1.12 -0.43 
0.02 -0.48 -1.15 -0.36 -1.13 -0.39 0.02 -0.48 -1.17 -0.33 -1.15 -0.36 0.02 -0.48 -1.19 -0.3 -1.17 -0.33 0.02 -0.48 0.02 -0.35 0.01 -0.22 -1.22 -0.29 -1.19 -0.3
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 4 5 6 7 8 9 10 11 -1 12 13 14 15 16 17 18 19 20 21 22 23 -1 0 23 22 1 -1 1 22 21 2 -1 
2 21 20 3 -1 3 20 19 4 -1 4 19 18 5 -1 5 18 17 6 -1 
6 17 16 7 -1 7 16 15 8 -1 8 15 14 9 -1 9 14 13 10 -1 
10 13 12 11 -1 11 12 23 0 -1
"
                    texcoordindex="0 1 2 3 4 5 6 7 8 9 10 11 -1 12 13 14 15 16 17 18 19 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 8.69 56.56 -1.79 72.54 56.56 -26.81 70.49 56.56 -31.57 68.11 56.56 -36.18
 65.43 56.56 -40.61 62.46 56.56 -44.85 59.2 56.56 -48.88 55.68 56.56 -52.68
 51.91 56.56 -56.24 47.9 56.56 -59.52 43.68 56.56 -62.53 -1.32 56.56 -6.05
 -1.32 52.12 -6.05 43.68 52.12 -62.53 47.9 52.12 -59.52 51.91 52.12 -56.24
 55.68 52.12 -52.68 59.2 52.12 -48.88 62.46 52.12 -44.85 65.43 52.12 -40.61
 68.11 52.12 -36.18 70.49 52.12 -31.57 72.54 52.12 -26.81 8.69 52.12 -1.79
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="-0.96 -1.09 0.18 -1.09 0.18 -0.96 0.17 -0.83 0.16 -0.7 0.14 -0.57 0.11 -0.45 0.08 -0.33 0.04 -0.21 0 -0.1 -0.05 0.01 -1.09 -0.9 -1.09 0.9 -0.05 0 0 0.11 0.04 0.22 0.08 0.34 0.11 0.46 0.14 0.58 0.16 0.71 0.17 0.84 0.18 0.97 0.18 1.1 -0.96 1.1 0 -7.43 0 -8.7 1.15 -8.7 1.15 -7.43 1.15 -7.43 1.15 -8.7 1.23 -8.7 1.23 -7.43 
1.23 -7.43 1.23 -8.7 1.32 -8.7 1.32 -7.43 1.32 -7.43 1.32 -8.7 1.41 -8.7 1.41 -7.43 1.41 -7.43 1.41 -8.7 1.49 -8.7 1.49 -7.43 1.49 -7.43 1.49 -8.7 1.58 -8.7 1.58 -7.43 
1.58 -7.43 1.58 -8.7 1.67 -8.7 1.67 -7.43 1.67 -7.43 1.67 -8.7 1.75 -8.7 1.75 -7.43 1.75 -7.43 1.75 -8.7 1.84 -8.7 1.84 -7.43 1.84 -7.43 1.84 -8.7 1.93 -8.7 1.93 -7.43 
1.93 -7.43 1.93 -8.7 3.13 -8.7 3.13 -7.43 3.13 -7.43 3.13 -8.7 3.31 -8.7 3.31 -7.43"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 25 24 1 -1 1 24 23 2 -1 2 23 22 3 -1 3 22 21 4 -1 
4 21 20 5 -1 5 20 19 6 -1 6 19 18 7 -1 7 18 17 8 -1 
8 17 16 9 -1 9 16 15 10 -1 10 15 14 11 -1 11 14 13 12 -1 
12 13 25 0 -1 17 18 19 20 -1 22 16 17 -1 17 21 22 -1 
17 20 21 -1 13 14 15 16 -1 16 25 13 -1 16 22 23 24 25 -1 
1 2 3 4 5 6 7 8 -1 9 10 11 12 -1 0 1 8 9 -1 9 12 0 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 -1 59 60 61 -1 
62 63 64 -1 65 66 67 68 -1 69 70 71 -1 72 73 74 75 76 -1 
77 78 79 80 81 82 83 84 -1 85 86 87 88 -1 89 90 91 92 -1 93 94 95 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 6.66 79.23 -5.37 49.08 79.23 -58.6 44.86 79.23 -61.73 40.44 79.23 -64.56
 35.84 79.23 -67.08 31.07 79.23 -69.28 26.16 79.23 -71.14 21.14 79.23 -72.66
 20.37 79.23 -67.86 12.84 79.23 -69.07 13.67 79.23 -74.24 10.18 79.23 -74.72
 6.66 79.23 -75.04 6.66 74.78 -75.04 10.18 74.78 -74.72 13.67 74.78 -74.24
 12.84 74.78 -69.07 20.37 74.78 -67.86 21.14 74.78 -72.66 26.16 74.78 -71.14
 31.07 74.78 -69.28 35.84 74.78 -67.08 40.44 74.78 -64.56 44.86 74.78 -61.73
 49.08 74.78 -58.6 6.66 74.78 -5.37"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -1.82 0 -3.09 1.14 -3.09 1.14 -1.82 1.14 -1.82 1.14 -3.09 1.23 -3.09 1.23 -1.82 1.23 -1.82 1.23 -3.09 1.31 -3.09 1.31 -1.82 1.31 -1.82 1.31 -3.09 1.4 -3.09 1.4 -1.82 
1.4 -1.82 1.4 -3.09 1.49 -3.09 1.49 -1.82 1.49 -1.82 1.49 -3.09 1.58 -3.09 1.58 -1.82 1.58 -1.82 1.58 -3.09 1.66 -3.09 1.66 -1.82 1.66 -1.82 1.66 -3.09 1.75 -3.09 1.75 -1.82 
1.75 -1.82 1.75 -3.09 1.87 -3.09 1.87 -1.82 1.87 -1.82 1.87 -3.09 1.96 -3.09 1.96 -1.82 1.96 -1.82 1.96 -3.09 2.02 -3.09 2.02 -1.82 2.02 -1.82 2.02 -3.09 2.08 -3.09 2.08 -1.82 
2.08 -1.82 2.08 -3.09 3.24 -3.09 3.24 -1.82 0.2 -0.59 0.27 -0.65 0.3 -0.53 0.33 -0.41 0.36 -0.15 0.14 -0.76 0.2 -0.59 0.2 -0.59 0.35 -0.28 0.36 -0.15 
0.2 -0.59 0.33 -0.41 0.35 -0.28 0.15 -0.97 0.18 -0.9 0.21 -0.82 0.14 -0.76 0.14 -0.76 -0.76 0.11 0.15 -0.97 0.14 -0.76 0.36 -0.15 0.37 -0.02 0.38 0.11 -0.76 0.11 
0.38 -0.1 0.37 0.03 0.36 0.16 0.35 0.29 0.33 0.42 0.3 0.54 0.27 0.66 0.2 0.6 0.14 0.77 0.21 0.83 0.18 0.91 0.15 0.98 -0.76 -0.1 0.38 -0.1 0.2 0.6 0.14 0.77 0.14 0.77 0.15 0.98 -0.76 -0.1
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="treadTex"></texture>
                    <material is="x3d" use="treadMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 17 16 1 -1 1 16 15 2 -1 2 15 14 3 -1 3 14 13 4 -1 
4 13 12 5 -1 5 12 11 6 -1 6 11 10 7 -1 7 10 9 8 -1 
8 9 17 0 -1 12 13 14 -1 14 11 12 -1 14 10 11 -1 
15 16 17 9 -1 9 10 14 15 -1 1 2 3 4 5 -1 8 0 1 -1 
1 7 8 -1 1 6 7 -1 1 5 6 -1
"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 -1 39 40 41 -1 42 43 44 -1 
45 46 47 48 -1 49 50 51 52 -1 53 54 55 56 57 -1 58 59 60 -1 
61 62 63 -1 64 65 66 -1 67 68 69 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 6.66 106.34 -4.7 6.66 106.34 -75.04 1.59 106.34 -75.21 -79.69 106.34 -75.21
 -79.69 106.34 -6.63 1.59 106.34 -6.63 2.97 106.34 -6.5 4.3 106.34 -6.13
 5.55 106.34 -5.52 5.55 101.89 -5.52 4.3 101.89 -6.13 2.97 101.89 -6.5
 1.59 101.89 -6.63 -79.69 101.89 -6.63 -79.69 101.89 -75.21 1.59 101.89 -75.21
 6.66 101.89 -75.04 6.66 101.89 -4.7"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -1.49 0 -2.76 1.18 -2.76 1.18 -1.49 1.18 -1.49 1.18 -2.76 1.26 -2.76 1.26 -1.49 1.26 -1.49 1.26 -2.76 2.62 -2.76 2.62 -1.49 2.62 -1.49 2.62 -2.76 3.76 -2.76 3.76 -1.49 
3.76 -1.49 3.76 -2.76 5.11 -2.76 5.11 -1.49 5.11 -1.49 5.11 -2.76 5.14 -2.76 5.14 -1.49 5.14 -1.49 5.14 -2.76 5.16 -2.76 5.16 -1.49 5.16 -1.49 5.16 -2.76 5.18 -2.76 5.18 -1.49 
5.18 -1.49 5.18 -2.76 5.21 -2.76 5.21 -1.49 -1.58 0.85 -1.58 -1.18 -0.44 -1.18 -0.44 -1.18 -1.59 0.89 -1.58 0.85 -0.44 -1.18 -1.59 0.92 -1.59 0.89 
-0.44 0.85 -0.44 0.98 -1.62 0.98 -1.6 0.95 -1.6 0.95 -1.59 0.92 -0.44 -1.18 -0.44 0.85 -0.44 -0.97 -0.44 -0.84 -0.44 1.19 -1.58 1.19 -1.58 -0.84 -1.6 -0.94 -1.62 -0.97 -0.44 -0.97 
-0.44 -0.97 -1.59 -0.91 -1.6 -0.94 -0.44 -0.97 -1.59 -0.88 -1.59 -0.91 -0.44 -0.97 -1.58 -0.84 -1.59 -0.88"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="stringTex"></texture>
                    <material is="x3d" use="stringMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1 4 5 6 -1 4 7 5 -1 7 8 5 -1 
7 9 8 -1 9 10 8 -1 9 11 10 -1 11 3 10 -1 
11 0 3 -1 1 12 2 -1 1 13 12 -1 13 14 12 -1 
13 15 14 -1 15 16 14 -1 15 17 16 -1 17 18 16 -1 
17 19 18 -1 6 18 19 4 -1 16 18 6 5 -1 14 16 5 8 -1 
12 14 8 10 -1 2 12 10 3 -1 7 4 19 17 -1 9 7 17 15 -1 
11 9 15 13 -1 0 11 13 1 -1
"
                    texcoordindex="0 1 2 3 -1 4 5 6 -1 7 8 9 -1 10 11 12 -1 
13 14 15 -1 16 17 18 -1 19 20 21 -1 22 23 24 -1 
25 26 27 -1 28 29 30 -1 31 32 33 -1 34 35 36 -1 
37 38 39 -1 40 41 42 -1 43 44 45 -1 46 47 48 -1 
49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1 76 77 78 79 -1 
80 81 82 83 -1 84 85 86 87 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 3.22 101.89 -0.96 3.22 -52.12 -0.96 6.47 -52.12 -4.87 6.47 101.89 -4.87
 -0.65 101.89 -0.2 -2.95 101.89 -5.13 -5.14 101.89 -2.58 0.08 101.89 -1.05
 0.12 101.89 -6.48 1.1 101.89 -1.5 3.48 101.89 -6.39 2.22 101.89 -1.47
 3.48 -32.93 -6.39 2.22 -32.93 -1.47 0.12 -13.73 -6.48 1.1 -13.73 -1.5
 -2.95 5.46 -5.13 0.08 5.46 -1.05 -5.14 24.66 -2.58 -0.65 24.66 -0.2
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 2.57 0 2.57 0.13 0 0.13 0.1 0 0 0 0.03 -0.07 0.02 0 0 0 -0.01 -0.12 0.1 0 0 0 0.03 -0.07 
0.02 0 0 0 -0.01 -0.12 0.1 0 0 0 0.03 -0.07 0.02 0 0 0 -0.01 -0.12 0.1 0 0 0 0.03 -0.07 
0.02 0 0 0 -0.01 -0.12 0.34 0 0 0 0.32 -0.12 0.33 0 0 0 0 -0.12 0.34 0 0 0 0.32 -0.12 
0.33 0 0 0 0 -0.12 0.34 0 0 0 0.32 -0.12 0.33 0 0 0 0 -0.12 0.34 0 0 0 0.32 -0.12 
0.33 0 0 0 0 -0.12 0 -0.12 1.29 -0.12 1.29 0 0 0 0.06 0.48 0 0 0 -1.93 0.06 -1.93 0.12 0.96 0.06 0.48 0.06 -1.93 0.12 -1.93 
0.17 1.44 0.12 0.96 0.12 -1.93 0.17 -1.93 0.23 1.92 0.17 1.44 0.17 -1.93 0.23 -1.93 0.02 1.94 0 1.94 0 0 0.02 -0.47 0.04 1.94 0.02 1.94 0.02 -0.47 0.04 -0.95 
0.06 1.94 0.04 1.94 0.04 -0.95 0.06 -1.43 0.08 1.94 0.06 1.94 0.06 -1.43 0.08 -1.91"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="stringTex"></texture>
                    <material is="x3d" use="stringMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1 4 5 6 -1 4 7 5 -1 7 8 5 -1 
7 9 8 -1 9 10 8 -1 9 11 10 -1 11 12 10 -1 
11 13 12 -1 13 3 12 -1 13 0 3 -1 1 14 2 -1 
1 15 14 -1 15 16 14 -1 15 17 16 -1 17 18 16 -1 
17 19 18 -1 19 20 18 -1 19 21 20 -1 21 22 20 -1 
21 23 22 -1 6 22 23 4 -1 20 22 6 5 -1 18 20 5 8 -1 
16 18 8 10 -1 14 16 10 12 -1 2 14 12 3 -1 7 4 23 21 -1 
9 7 21 19 -1 11 9 19 17 -1 13 11 17 15 -1 0 13 15 1 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 -1 7 8 9 -1 10 11 12 -1 
13 14 15 -1 16 17 18 -1 19 20 21 -1 22 23 24 -1 
25 26 27 -1 28 29 30 -1 31 32 33 -1 34 35 36 -1 
37 38 39 -1 40 41 42 -1 43 44 45 -1 46 47 48 -1 
49 50 51 -1 52 53 54 -1 55 56 57 -1 58 59 60 -1 
61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1 
76 77 78 79 -1 80 81 82 83 -1 84 85 86 87 -1 88 89 90 91 -1 
92 93 94 95 -1 96 97 98 99 -1 100 101 102 103 -1 104 105 106 107 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 3.17 52.66 2.98 3.17 -128.9 2.98 6.33 -128.9 6.96 6.33 52.66 6.96
 3.22 101.89 -0.96 8.41 101.89 -2.4 6.47 101.89 -4.87 3.87 101.89 -0.14
 9.2 101.89 0.63 4.13 101.89 0.87 8.7 101.89 3.73 3.96 101.89 1.91
 6.99 57.66 6.37 3.39 57.66 2.79 6.99 -123.88 6.37 3.39 -123.88 2.79
 8.7 -105.9 3.73 3.96 -105.9 1.91 9.2 -87.97 0.63 4.13 -87.97 0.87
 8.41 -70.05 -2.4 3.87 -70.05 -0.14 6.47 -52.12 -4.87 3.22 -52.12 -0.96
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 3.03 0 3.03 0.13 0 0.13 0.09 0 0 0 0.03 -0.07 0.02 0 0 0 -0.01 -0.12 0.09 0 0 0 0.03 -0.07 
0.02 0 0 0 -0.01 -0.12 0.09 0 0 0 0.03 -0.07 0.02 0 0 0 -0.01 -0.12 0.75 0 0 0 0.74 -0.12 
0.74 0 0 0 0 -0.12 0.12 0 0 0 0.06 -0.09 0.09 0 0 0 0 -0.12 0.12 0 0 0 0.06 -0.09 
0.09 0 0 0 0 -0.12 0.32 0 0 0 0.3 -0.12 0.31 0 0 0 0 -0.12 0.32 0 0 0 0.3 -0.12 
0.3 0 0 0 0 -0.12 0.32 0 0 0 0.3 -0.12 0.3 0 0 0 0 -0.12 0.32 0 0 0 0.3 -0.12 
0.3 0 0 0 0 -0.12 0 -0.12 2.57 -0.12 2.57 0 0 0 0.06 0.45 0 0 0 -3.85 0.06 -3.85 0.11 0.9 0.06 0.45 0.06 -3.85 0.11 -3.85 
0.16 1.35 0.11 0.9 0.11 -3.85 0.16 -3.85 -0.42 -0.23 -0.73 -0.19 -4.18 -0.55 -3.44 -0.55 -0.28 -0.57 -0.37 -0.57 -3.35 -1.36 -3.26 -1.36 0.02 3.86 0 3.86 0 0 0.02 -0.44 
0.04 3.86 0.02 3.86 0.02 -0.44 0.04 -0.89 0.06 3.86 0.04 3.86 0.04 -0.89 0.06 -1.34 -1.77 0.06 -2.51 0.06 0.95 -0.06 1.25 -0.04 -1.69 0.15 -1.77 0.15 1.25 -0.11 1.33 -0.11
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="stringTex"></texture>
                    <material is="x3d" use="stringMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1 4 5 6 -1 4 7 5 -1 7 8 5 -1 
7 9 8 -1 9 10 8 -1 9 11 10 -1 11 3 10 -1 
11 0 3 -1 1 12 2 -1 1 13 12 -1 13 14 12 -1 
13 15 14 -1 15 16 14 -1 15 17 16 -1 17 18 16 -1 
17 19 18 -1 6 18 19 4 -1 16 18 6 5 -1 14 16 5 8 -1 
12 14 8 10 -1 2 12 10 3 -1 7 4 19 17 -1 9 7 17 15 -1 
11 9 15 13 -1 0 11 13 1 -1
"
                    texcoordindex="0 1 2 3 -1 4 5 6 -1 7 8 9 -1 10 11 12 -1 
13 14 15 -1 16 17 18 -1 19 20 21 -1 22 23 24 -1 
25 26 27 -1 28 29 30 -1 31 32 33 -1 34 35 36 -1 
37 38 39 -1 40 41 42 -1 43 44 45 -1 46 47 48 -1 
49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1 76 77 78 79 -1 
80 81 82 83 -1 84 85 86 87 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -0.68 -24.09 2.13 -0.68 -192.75 2.13 -5.22 -192.75 4.4 -5.22 -24.09 4.4
 3.17 52.66 2.98 2.94 31.38 8.49 6.33 52.66 6.96 2.04 31.38 3.49
 -0.77 10.11 8.24 0.81 10.11 3.41 -3.91 -11.16 6.26 -0.24 -11.16 2.75
 -3.91 -192.75 6.26 -0.24 -192.75 2.75 -0.77 -171.46 8.24 0.81 -171.46 3.41
 2.94 -150.18 8.49 2.04 -150.18 3.49 6.33 -128.9 6.96 3.17 -128.9 2.98
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 2.82 0 2.82 0.13 0 0.13 0.37 0 0 0 0.36 -0.12 0.36 0 0 0 0 -0.12 0.37 0 0 0 0.36 -0.12 
0.36 0 0 0 0 -0.12 0.37 0 0 0 0.36 -0.12 0.36 0 0 0 0 -0.12 0.24 0 0 0 0.21 -0.11 
0.22 0 0 0 0 -0.12 0.09 0 0 0 0.02 -0.05 0.02 0 0 0 -0.01 -0.12 0.37 0 0 0 0.36 -0.12 
0.36 0 0 0 0 -0.12 0.37 0 0 0 0.36 -0.12 0.36 0 0 0 0 -0.12 0.37 0 0 0 0.36 -0.12 
0.36 0 0 0 0 -0.12 0 -0.12 3.03 -0.12 3.03 0 0 0 0.36 0 0 0 -2.98 -0.78 -2.62 -0.78 0.73 0 0.36 0 -2.62 -0.78 -2.26 -0.78 
1.09 0 0.73 0 -2.26 -0.78 -1.9 -0.78 1.09 -0.05 1.09 0 -1.9 -0.78 -1.68 -0.78 -2.66 0.27 -3.02 0.27 0 0 0.36 0 -2.31 0.27 -2.66 0.27 0.36 0 0.72 0 
-1.95 0.27 -2.31 0.27 0.72 0 1.07 0 -1.73 0.27 -1.95 0.27 1.07 0 1.07 0.02"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="stringTex"></texture>
                    <material is="x3d" use="stringMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1 4 5 6 -1 4 7 5 -1 7 8 5 -1 
7 9 8 -1 9 10 8 -1 9 11 10 -1 11 3 10 -1 
11 0 3 -1 1 12 2 -1 1 13 12 -1 13 14 12 -1 
13 15 14 -1 15 16 14 -1 15 17 16 -1 17 18 16 -1 
17 19 18 -1 6 18 19 4 -1 16 18 6 5 -1 14 16 5 8 -1 
12 14 8 10 -1 2 12 10 3 -1 7 4 19 17 -1 9 7 17 15 -1 
11 9 15 13 -1 0 11 13 1 -1
"
                    texcoordindex="0 1 2 3 -1 4 5 6 -1 7 8 9 -1 10 11 12 -1 
13 14 15 -1 16 17 18 -1 19 20 21 -1 22 23 24 -1 
25 26 27 -1 28 29 30 -1 31 32 33 -1 34 35 36 -1 
37 38 39 -1 40 41 42 -1 43 44 45 -1 46 47 48 -1 
49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1 76 77 78 79 -1 
80 81 82 83 -1 84 85 86 87 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 0.95 -100.89 -1.46 0.95 -192.75 -1.46 -0.35 -192.75 -6.38 -0.35 -100.89 -6.38
 -0.68 -24.09 2.13 -6.03 -43.29 1.14 -5.22 -24.09 4.4 -0.95 -43.29 1.04
 -5.35 -62.49 -2.15 -0.72 -62.49 -0.06 -3.33 -81.69 -4.83 -0.05 -81.69 -0.95
 -3.33 -192.75 -4.83 -0.05 -192.75 -0.95 -5.35 -192.75 -2.15 -0.72 -192.75 -0.06
 -6.03 -192.75 1.14 -0.95 -192.75 1.04 -5.22 -192.75 4.4 -0.68 -192.75 2.13
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 1.54 0 1.54 0.13 0 0.13 0.34 0 0 0 0.32 -0.12 0.33 0 0 0 0 -0.12 0.34 0 0 0 0.32 -0.12 
0.33 0 0 0 0 -0.12 0.34 0 0 0 0.32 -0.12 0.33 0 0 0 0 -0.12 0.34 0 0 0 0.32 -0.12 
0.33 0 0 0 0 -0.12 0.1 0 0 0 0.03 -0.07 0.02 0 0 0 -0.01 -0.12 0.1 0 0 0 0.03 -0.07 
0.02 0 0 0 -0.01 -0.12 0.1 0 0 0 0.03 -0.07 0.02 0 0 0 -0.01 -0.12 0.1 0 0 0 0.03 -0.07 
0.02 0 0 0 -0.01 -0.12 0 -0.12 2.82 -0.12 2.82 0 0 0 0.01 -0.08 0 0 -2.76 -0.72 -2.44 -0.72 0.02 -0.16 0.01 -0.08 -2.44 -0.72 -2.11 -0.72 
0.03 -0.24 0.02 -0.16 -2.11 -0.72 -1.79 -0.72 0.04 -0.33 0.03 -0.24 -1.79 -0.72 -1.46 -0.72 -2.48 0.25 -2.8 0.25 0 0 0.01 0.03 -2.16 0.25 -2.48 0.25 0.01 0.03 0.01 0.06 
-1.84 0.25 -2.16 0.25 0.01 0.06 0.01 0.09 -1.52 0.25 -1.84 0.25 0.01 0.09 0.01 0.12"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="handrailTex"></texture>
                    <material is="x3d" use="handrailMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 3 0 2 -1 4 0 3 -1 5 4 3 -1 
6 4 5 -1 7 6 5 -1 8 6 7 -1 9 8 7 -1 
10 8 9 -1 11 10 9 -1 12 10 11 -1 13 12 11 -1 
14 12 13 -1 15 14 13 -1 16 14 15 -1 17 16 15 -1 
18 16 17 -1 19 18 17 -1 20 18 19 -1 21 20 19 -1 
22 20 21 -1 23 22 21 -1 24 22 23 -1 25 24 23 -1 
26 24 25 -1 27 26 25 -1 28 26 27 -1 29 28 27 -1 
30 28 29 -1 31 30 29 -1 32 30 31 -1 33 32 31 -1 
34 32 33 -1 35 34 33 -1 36 34 35 -1 37 36 35 -1 
38 36 37 -1 39 38 37 -1 40 38 39 -1 41 40 39 -1 
42 40 41 -1 43 42 41 -1 44 42 43 -1 45 44 43 -1 
46 44 45 -1 47 46 45 -1 48 46 47 -1 49 48 47 -1 
50 48 49 -1 51 50 49 -1 52 50 51 -1 53 52 51 -1 
54 52 53 -1 55 54 53 -1 56 54 55 -1 57 56 55 -1 
58 56 57 -1 59 58 57 -1 60 58 59 -1 61 60 59 -1 
62 60 61 -1 63 62 61 -1 64 62 63 -1 65 64 63 -1 
66 64 65 -1 67 66 65 -1 68 66 67 -1 69 68 67 -1 
70 68 69 -1 71 70 69 -1 72 70 71 -1 73 72 71 -1 
74 72 73 -1 75 74 73 -1 76 74 75 -1 77 76 75 -1 
78 76 77 -1 79 78 77 -1 80 78 79 -1 81 80 79 -1 
82 80 81 -1 83 82 81 -1 84 82 83 -1 85 84 83 -1 
86 84 85 -1 87 86 85 -1 88 86 87 -1 89 88 87 -1 
90 88 89 -1 91 90 89 -1 92 91 89 -1 93 91 92 -1 
3 2 94 -1 95 3 94 -1 5 3 95 -1 96 5 95 -1 
7 5 96 -1 97 7 96 -1 9 7 97 -1 98 9 97 -1 
11 9 98 -1 99 11 98 -1 13 11 99 -1 100 13 99 -1 
15 13 100 -1 101 15 100 -1 17 15 101 -1 102 17 101 -1 
19 17 102 -1 103 19 102 -1 21 19 103 -1 104 21 103 -1 
23 21 104 -1 105 23 104 -1 25 23 105 -1 106 25 105 -1 
27 25 106 -1 107 27 106 -1 29 27 107 -1 108 29 107 -1 
31 29 108 -1 109 31 108 -1 33 31 109 -1 110 33 109 -1 
35 33 110 -1 111 35 110 -1 37 35 111 -1 112 37 111 -1 
39 37 112 -1 113 39 112 -1 41 39 113 -1 114 41 113 -1 
43 41 114 -1 115 43 114 -1 45 43 115 -1 116 45 115 -1 
47 45 116 -1 117 47 116 -1 49 47 117 -1 118 49 117 -1 
51 49 118 -1 119 51 118 -1 53 51 119 -1 120 53 119 -1 
55 53 120 -1 121 55 120 -1 57 55 121 -1 122 57 121 -1 
59 57 122 -1 123 59 122 -1 61 59 123 -1 124 61 123 -1 
63 61 124 -1 125 63 124 -1 65 63 125 -1 126 65 125 -1 
67 65 126 -1 127 67 126 -1 69 67 127 -1 128 69 127 -1 
71 69 128 -1 129 71 128 -1 73 71 129 -1 130 73 129 -1 
75 73 130 -1 131 75 130 -1 77 75 131 -1 132 77 131 -1 
79 77 132 -1 133 79 132 -1 81 79 133 -1 134 81 133 -1 
83 81 134 -1 135 83 134 -1 85 83 135 -1 136 85 135 -1 
87 85 136 -1 137 87 136 -1 89 87 137 -1 138 89 137 -1 
92 89 138 -1 93 92 138 -1 139 93 138 -1 140 93 139 -1 
141 94 142 -1 95 94 141 -1 143 95 141 -1 96 95 143 -1 
144 96 143 -1 97 96 144 -1 145 97 144 -1 98 97 145 -1 
146 98 145 -1 99 98 146 -1 147 99 146 -1 100 99 147 -1 
148 100 147 -1 101 100 148 -1 149 101 148 -1 102 101 149 -1 
150 102 149 -1 103 102 150 -1 151 103 150 -1 104 103 151 -1 
152 104 151 -1 105 104 152 -1 153 105 152 -1 106 105 153 -1 
154 106 153 -1 107 106 154 -1 155 107 154 -1 108 107 155 -1 
156 108 155 -1 109 108 156 -1 157 109 156 -1 110 109 157 -1 
158 110 157 -1 111 110 158 -1 159 111 158 -1 112 111 159 -1 
160 112 159 -1 113 112 160 -1 161 113 160 -1 114 113 161 -1 
162 114 161 -1 115 114 162 -1 163 115 162 -1 116 115 163 -1 
164 116 163 -1 117 116 164 -1 165 117 164 -1 118 117 165 -1 
166 118 165 -1 119 118 166 -1 167 119 166 -1 120 119 167 -1 
168 120 167 -1 121 120 168 -1 169 121 168 -1 122 121 169 -1 
170 122 169 -1 123 122 170 -1 171 123 170 -1 124 123 171 -1 
172 124 171 -1 125 124 172 -1 173 125 172 -1 126 125 173 -1 
174 126 173 -1 127 126 174 -1 175 127 174 -1 128 127 175 -1 
176 128 175 -1 129 128 176 -1 177 129 176 -1 130 129 177 -1 
178 130 177 -1 131 130 178 -1 179 131 178 -1 132 131 179 -1 
180 132 179 -1 133 132 180 -1 181 133 180 -1 134 133 181 -1 
182 134 181 -1 135 134 182 -1 183 135 182 -1 136 135 183 -1 
184 136 183 -1 137 136 184 -1 185 137 184 -1 138 137 185 -1 
186 138 185 -1 187 138 186 -1 139 138 187 -1 140 139 187 -1 
0 142 1 -1 141 142 0 -1 143 141 0 -1 4 143 0 -1 
144 143 4 -1 6 144 4 -1 145 144 6 -1 8 145 6 -1 
146 145 8 -1 10 146 8 -1 147 146 10 -1 12 147 10 -1 
148 147 12 -1 14 148 12 -1 149 148 14 -1 16 149 14 -1 
150 149 16 -1 18 150 16 -1 151 150 18 -1 20 151 18 -1 
152 151 20 -1 22 152 20 -1 153 152 22 -1 24 153 22 -1 
154 153 24 -1 26 154 24 -1 155 154 26 -1 28 155 26 -1 
156 155 28 -1 30 156 28 -1 157 156 30 -1 32 157 30 -1 
158 157 32 -1 34 158 32 -1 159 158 34 -1 36 159 34 -1 
160 159 36 -1 38 160 36 -1 161 160 38 -1 40 161 38 -1 
162 161 40 -1 42 162 40 -1 163 162 42 -1 44 163 42 -1 
164 163 44 -1 46 164 44 -1 165 164 46 -1 48 165 46 -1 
166 165 48 -1 50 166 48 -1 167 166 50 -1 52 167 50 -1 
168 167 52 -1 54 168 52 -1 169 168 54 -1 56 169 54 -1 
170 169 56 -1 58 170 56 -1 171 170 58 -1 60 171 58 -1 
172 171 60 -1 62 172 60 -1 173 172 62 -1 64 173 62 -1 
174 173 64 -1 66 174 64 -1 175 174 66 -1 68 175 66 -1 
176 175 68 -1 70 176 68 -1 177 176 70 -1 72 177 70 -1 
178 177 72 -1 74 178 72 -1 179 178 74 -1 76 179 74 -1 
180 179 76 -1 78 180 76 -1 181 180 78 -1 80 181 78 -1 
182 181 80 -1 82 182 80 -1 183 182 82 -1 84 183 82 -1 
184 183 84 -1 86 184 84 -1 185 184 86 -1 88 185 86 -1 
186 185 88 -1 187 186 88 -1 90 187 88 -1 91 187 90 -1 
142 94 2 1 -1 93 140 187 91 -1
"
                    texcoordindex="0 1 2 -1 3 4 5 -1 6 7 8 -1 9 10 11 -1 
12 13 14 -1 15 16 17 -1 18 19 20 -1 21 22 23 -1 
24 25 26 -1 27 28 29 -1 30 31 32 -1 33 34 35 -1 
36 37 38 -1 39 40 41 -1 42 43 44 -1 45 46 47 -1 
48 49 50 -1 51 52 53 -1 54 55 56 -1 57 58 59 -1 
60 61 62 -1 63 64 65 -1 66 67 68 -1 69 70 71 -1 
72 73 74 -1 75 76 77 -1 78 79 80 -1 81 82 83 -1 
84 85 86 -1 87 88 89 -1 90 91 92 -1 93 94 95 -1 
96 97 98 -1 99 100 101 -1 102 103 104 -1 105 106 107 -1 
108 109 110 -1 111 112 113 -1 114 115 116 -1 117 118 119 -1 
120 121 122 -1 123 124 125 -1 126 127 128 -1 129 130 131 -1 
132 133 134 -1 135 136 137 -1 138 139 140 -1 141 142 143 -1 
144 145 146 -1 147 148 149 -1 150 151 152 -1 153 154 155 -1 
156 157 158 -1 159 160 161 -1 162 163 164 -1 165 166 167 -1 
168 169 170 -1 171 172 173 -1 174 175 176 -1 177 178 179 -1 
180 181 182 -1 183 184 185 -1 186 187 188 -1 189 190 191 -1 
192 193 194 -1 195 196 197 -1 198 199 200 -1 201 202 203 -1 
204 205 206 -1 207 208 209 -1 210 211 212 -1 213 214 215 -1 
216 217 218 -1 219 220 221 -1 222 223 224 -1 225 226 227 -1 
228 229 230 -1 231 232 233 -1 234 235 236 -1 237 238 239 -1 
240 241 242 -1 243 244 245 -1 246 247 248 -1 249 250 251 -1 
252 253 254 -1 255 256 257 -1 258 259 260 -1 261 262 263 -1 
264 265 266 -1 267 268 269 -1 270 271 272 -1 273 274 275 -1 
276 277 278 -1 279 280 281 -1 282 283 284 -1 285 286 287 -1 
288 289 290 -1 291 292 293 -1 294 295 296 -1 297 298 299 -1 
300 301 302 -1 303 304 305 -1 306 307 308 -1 309 310 311 -1 
312 313 314 -1 315 316 317 -1 318 319 320 -1 321 322 323 -1 
324 325 326 -1 327 328 329 -1 330 331 332 -1 333 334 335 -1 
336 337 338 -1 339 340 341 -1 342 343 344 -1 345 346 347 -1 
348 349 350 -1 351 352 353 -1 354 355 356 -1 357 358 359 -1 
360 361 362 -1 363 364 365 -1 366 367 368 -1 369 370 371 -1 
372 373 374 -1 375 376 377 -1 378 379 380 -1 381 382 383 -1 
384 385 386 -1 387 388 389 -1 390 391 392 -1 393 394 395 -1 
396 397 398 -1 399 400 401 -1 402 403 404 -1 405 406 407 -1 
408 409 410 -1 411 412 413 -1 414 415 416 -1 417 418 419 -1 
420 421 422 -1 423 424 425 -1 426 427 428 -1 429 430 431 -1 
432 433 434 -1 435 436 437 -1 438 439 440 -1 441 442 443 -1 
444 445 446 -1 447 448 449 -1 450 451 452 -1 453 454 455 -1 
456 457 458 -1 459 460 461 -1 462 463 464 -1 465 466 467 -1 
468 469 470 -1 471 472 473 -1 474 475 476 -1 477 478 479 -1 
480 481 482 -1 483 484 485 -1 486 487 488 -1 489 490 491 -1 
492 493 494 -1 495 496 497 -1 498 499 500 -1 501 502 503 -1 
504 505 506 -1 507 508 509 -1 510 511 512 -1 513 514 515 -1 
516 517 518 -1 519 520 521 -1 522 523 524 -1 525 526 527 -1 
528 529 530 -1 531 532 533 -1 534 535 536 -1 537 538 539 -1 
540 541 542 -1 543 544 545 -1 546 547 548 -1 549 550 551 -1 
552 553 554 -1 555 556 557 -1 558 559 560 -1 561 562 563 -1 
564 565 566 -1 567 568 569 -1 570 571 572 -1 573 574 575 -1 
576 577 578 -1 579 580 581 -1 582 583 584 -1 585 586 587 -1 
588 589 590 -1 591 592 593 -1 594 595 596 -1 597 598 599 -1 
600 601 602 -1 603 604 605 -1 606 607 608 -1 609 610 611 -1 
612 613 614 -1 615 616 617 -1 618 619 620 -1 621 622 623 -1 
624 625 626 -1 627 628 629 -1 630 631 632 -1 633 634 635 -1 
636 637 638 -1 639 640 641 -1 642 643 644 -1 645 646 647 -1 
648 649 650 -1 651 652 653 -1 654 655 656 -1 657 658 659 -1 
660 661 662 -1 663 664 665 -1 666 667 668 -1 669 670 671 -1 
672 673 674 -1 675 676 677 -1 678 679 680 -1 681 682 683 -1 
684 685 686 -1 687 688 689 -1 690 691 692 -1 693 694 695 -1 
696 697 698 -1 699 700 701 -1 702 703 704 -1 705 706 707 -1 
708 709 710 -1 711 712 713 -1 714 715 716 -1 717 718 719 -1 
720 721 722 -1 723 724 725 -1 726 727 728 -1 729 730 731 -1 
732 733 734 -1 735 736 737 -1 738 739 740 -1 741 742 743 -1 
744 745 746 -1 747 748 749 -1 750 751 752 -1 753 754 755 -1 
756 757 758 -1 759 760 761 -1 762 763 764 -1 765 766 767 -1 
768 769 770 -1 771 772 773 -1 774 775 776 -1 777 778 779 -1 
780 781 782 -1 783 784 785 -1 786 787 788 -1 789 790 791 -1 
792 793 794 -1 795 796 797 -1 798 799 800 -1 801 802 803 -1 
804 805 806 -1 807 808 809 -1 810 811 812 -1 813 814 815 -1 
816 817 818 -1 819 820 821 -1 822 823 824 -1 825 826 827 -1 
828 829 830 -1 831 832 833 -1 834 835 836 -1 837 838 839 -1 
840 841 842 -1 843 844 845 -1 846 847 848 -1 849 850 851 -1 
852 853 854 -1 855 856 857 -1 858 859 860 -1 861 862 863 -1 
864 865 866 -1 867 868 869 -1 870 871 872 -1 873 874 875 -1 
876 877 878 -1 879 880 881 -1 882 883 884 -1 885 886 887 -1 
888 889 890 -1 891 892 893 -1 894 895 896 -1 897 898 899 -1 
900 901 902 -1 903 904 905 -1 906 907 908 -1 909 910 911 -1 
912 913 914 -1 915 916 917 -1 918 919 920 -1 921 922 923 -1 
924 925 926 -1 927 928 929 -1 930 931 932 -1 933 934 935 -1 
936 937 938 -1 939 940 941 -1 942 943 944 -1 945 946 947 -1 
948 949 950 -1 951 952 953 -1 954 955 956 -1 957 958 959 -1 
960 961 962 -1 963 964 965 -1 966 967 968 -1 969 970 971 -1 
972 973 974 -1 975 976 977 -1 978 979 980 -1 981 982 983 -1 
984 985 986 -1 987 988 989 -1 990 991 992 -1 993 994 995 -1 
996 997 998 -1 999 1000 1001 -1 1002 1003 1004 -1 1005 1006 1007 -1 
1008 1009 1010 -1 1011 1012 1013 -1 1014 1015 1016 -1 1017 1018 1019 -1 
1020 1021 1022 -1 1023 1024 1025 -1 1026 1027 1028 -1 1029 1030 1031 -1 
1032 1033 1034 -1 1035 1036 1037 -1 1038 1039 1040 -1 1041 1042 1043 -1 
1044 1045 1046 -1 1047 1048 1049 -1 1050 1051 1052 -1 1053 1054 1055 -1 
1056 1057 1058 -1 1059 1060 1061 -1 1062 1063 1064 -1 1065 1066 1067 -1 
1068 1069 1070 -1 1071 1072 1073 -1 1074 1075 1076 -1 1077 1078 1079 -1 
1080 1081 1082 -1 1083 1084 1085 -1 1086 1087 1088 -1 1089 1090 1091 -1 
1092 1093 1094 -1 1095 1096 1097 -1 1098 1099 1100 -1 1101 1102 1103 -1 
1104 1105 1106 1107 -1 1108 1109 1110 1111 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 1.75 190.1 -69.97 1.59 190.2 -69.97 1.59 190.2 -76.64 1.77 190.1 -76.64
 3.77 188.88 -69.94 3.97 188.88 -76.6 5.78 187.65 -69.85 6.17 187.65 -76.5
 7.78 186.43 -69.7 8.37 186.43 -76.34 9.79 185.2 -69.5 10.56 185.2 -76.12
 11.78 183.97 -69.23 12.74 183.97 -75.83 13.77 182.75 -68.92 14.91 182.75 -75.49
 15.75 181.52 -68.54 17.08 181.52 -75.08 17.71 180.3 -68.11 19.23 180.3 -74.61
 19.67 179.07 -67.63 21.37 179.07 -74.08 21.61 177.85 -67.09 23.49 177.85 -73.49
 23.53 176.62 -66.49 25.59 176.62 -72.83 25.44 175.39 -65.84 27.68 175.39 -72.12
 27.32 174.17 -65.14 29.74 174.17 -71.36 29.19 172.94 -64.39 31.78 172.94 -70.53
 31.03 171.72 -63.58 33.8 171.72 -69.64 32.85 170.49 -62.72 35.79 170.49 -68.7
 34.64 169.27 -61.8 37.75 169.27 -67.7 36.41 168.04 -60.84 39.68 168.04 -66.65
 38.15 166.81 -59.83 41.59 166.81 -65.54 39.86 165.59 -58.77 43.46 165.59 -64.38
 41.54 164.36 -57.66 45.29 164.36 -63.17 43.19 163.14 -56.5 47.1 163.14 -61.9
 44.8 161.91 -55.3 48.86 161.91 -60.59 46.38 160.69 -54.05 50.59 160.69 -59.22
 47.92 159.46 -52.76 52.28 159.46 -57.81 49.43 158.23 -51.42 53.92 158.23 -56.35
 50.9 157.01 -50.04 55.53 157.01 -54.84 52.32 155.78 -48.62 57.09 155.78 -53.29
 53.71 154.56 -47.17 58.61 154.56 -51.69 55.06 153.33 -45.67 60.08 153.33 -50.05
 56.36 152.11 -44.13 61.5 152.11 -48.37 57.62 150.88 -42.56 62.88 150.88 -46.65
 58.83 149.65 -40.96 64.21 149.65 -44.9 60 148.43 -39.32 65.48 148.43 -43.1
 61.12 147.2 -37.64 66.71 147.2 -41.27 62.19 145.98 -35.94 67.88 145.98 -39.41
 63.21 144.75 -34.21 69 144.75 -37.51 64.18 143.53 -32.44 70.06 143.53 -35.59
 65.11 142.3 -30.65 71.07 142.3 -33.63 65.98 141.07 -28.84 72.03 141.07 -31.64
 66.8 139.85 -27 72.93 139.85 -29.63 67.57 138.62 -25.14 73.77 138.62 -27.6
 68.28 137.4 -23.26 74.55 137.4 -25.54 68.94 136.17 -21.36 69.17 135.73 -20.67
 75.27 136.17 -23.46 75.56 135.65 -22.58 1.59 194.66 -76.64 3.79 193.44 -76.61
 5.99 192.21 -76.51 8.19 190.98 -76.36 10.38 189.76 -76.14 12.57 188.53 -75.86
 14.74 187.31 -75.52 16.91 186.08 -75.11 19.06 184.86 -74.65 21.2 183.63 -74.12
 23.32 182.4 -73.54 25.42 181.18 -72.89 27.51 179.95 -72.18 29.57 178.73 -71.42
 31.62 177.5 -70.6 33.64 176.28 -69.72 35.63 175.05 -68.78 37.59 173.82 -67.79
 39.53 172.6 -66.74 41.43 171.37 -65.63 43.31 170.15 -64.48 45.15 168.92 -63.27
 46.95 167.7 -62.01 48.72 166.47 -60.69 50.45 165.24 -59.33 52.14 164.02 -57.92
 53.79 162.79 -56.47 55.4 161.57 -54.96 56.97 160.34 -53.41 58.49 159.12 -51.82
 59.96 157.89 -50.19 61.39 156.66 -48.51 62.77 155.44 -46.79 64.1 154.21 -45.04
 65.38 152.99 -43.25 66.61 151.76 -41.42 67.79 150.54 -39.56 68.91 149.31 -37.67
 69.98 148.08 -35.74 71 146.86 -33.79 71.95 145.63 -31.8 72.86 144.41 -29.8
 73.7 143.18 -27.76 74.49 141.96 -25.7 75.21 140.73 -23.63 75.88 139.5 -21.53
 76.15 138.98 -20.63 3.61 193.44 -69.94 1.59 194.66 -69.97 5.62 192.21 -69.86
 7.62 190.98 -69.71 9.63 189.76 -69.51 11.62 188.53 -69.26 13.61 187.31 -68.94
 15.59 186.08 -68.58 17.56 184.86 -68.15 19.51 183.63 -67.67 21.45 182.4 -67.13
 23.38 181.18 -66.54 25.28 179.95 -65.9 27.17 178.73 -65.2 29.04 177.5 -64.45
 30.88 176.28 -63.64 32.7 175.05 -62.79 34.5 173.82 -61.88 36.27 172.6 -60.92
 38.01 171.37 -59.91 39.73 170.15 -58.85 41.41 168.92 -57.75 43.06 167.7 -56.6
 44.67 166.47 -55.4 46.26 165.24 -54.15 47.8 164.02 -52.86 49.31 162.79 -51.53
 50.78 161.57 -50.16 52.21 160.34 -48.74 53.6 159.12 -47.28 54.95 157.89 -45.79
 56.26 156.66 -44.26 57.52 155.44 -42.69 58.73 154.21 -41.09 59.9 152.99 -39.45
 61.03 151.76 -37.78 62.1 150.54 -36.08 63.13 149.31 -34.35 64.11 148.08 -32.59
 65.03 146.86 -30.8 65.91 145.63 -28.99 66.74 144.41 -27.15 67.51 143.18 -25.29
 68.23 141.96 -23.41 68.89 140.73 -21.51 69.5 139.5 -19.59 69.74 138.98 -18.78
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0.01 0.08 0 0.08 0 -0.09 0.01 -0.09 0.01 0.08 0 -0.09 0.05 0.08 0.01 0.08 0.01 -0.09 0.05 -0.09 0.05 0.08 0.01 -0.09 
0.09 0.08 0.05 0.08 0.05 -0.09 0.09 -0.09 0.09 0.08 0.05 -0.09 0.13 0.08 0.09 0.08 0.09 -0.09 0.13 -0.09 0.13 0.08 0.09 -0.09 
0.17 0.08 0.14 0.08 0.13 -0.09 0.18 -0.09 0.17 0.08 0.13 -0.09 0.22 0.08 0.18 0.08 0.18 -0.09 0.22 -0.09 0.22 0.08 0.18 -0.09 
0.26 0.08 0.22 0.08 0.22 -0.09 0.26 -0.09 0.26 0.08 0.22 -0.09 0.3 0.08 0.26 0.08 0.26 -0.09 0.3 -0.09 0.3 0.08 0.26 -0.09 
0.34 0.08 0.3 0.08 0.3 -0.09 0.34 -0.09 0.34 0.08 0.3 -0.09 0.38 0.08 0.35 0.08 0.34 -0.09 0.39 -0.09 0.38 0.08 0.34 -0.09 
0.43 0.08 0.39 0.08 0.39 -0.09 0.43 -0.09 0.43 0.08 0.39 -0.09 0.47 0.08 0.43 0.08 0.43 -0.09 0.47 -0.09 0.47 0.08 0.43 -0.09 
0.51 0.08 0.47 0.08 0.47 -0.09 0.51 -0.09 0.51 0.08 0.47 -0.09 0.55 0.08 0.51 0.08 0.51 -0.09 0.55 -0.09 0.55 0.08 0.51 -0.09 
0.59 0.08 0.56 0.08 0.55 -0.09 0.6 -0.09 0.59 0.08 0.55 -0.09 0.64 0.08 0.6 0.08 0.6 -0.09 0.64 -0.09 0.64 0.08 0.6 -0.09 
0.68 0.08 0.64 0.08 0.64 -0.09 0.68 -0.09 0.68 0.08 0.64 -0.09 0.72 0.08 0.68 0.08 0.68 -0.09 0.72 -0.09 0.72 0.08 0.68 -0.09 
0.76 0.08 0.72 0.08 0.72 -0.09 0.76 -0.09 0.76 0.08 0.72 -0.09 0.8 0.08 0.77 0.08 0.76 -0.09 0.81 -0.09 0.8 0.08 0.76 -0.09 
0.85 0.08 0.81 0.08 0.81 -0.09 0.85 -0.09 0.85 0.08 0.81 -0.09 0.89 0.08 0.85 0.08 0.85 -0.09 0.89 -0.09 0.89 0.08 0.85 -0.09 
0.93 0.08 0.89 0.08 0.89 -0.09 0.93 -0.09 0.93 0.08 0.89 -0.09 0.97 0.08 0.93 0.08 0.93 -0.09 0.97 -0.09 0.97 0.08 0.93 -0.09 
1.01 0.08 0.98 0.08 0.97 -0.09 1.02 -0.09 1.01 0.08 0.97 -0.09 1.06 0.08 1.02 0.08 1.02 -0.09 1.06 -0.09 1.06 0.08 1.02 -0.09 
1.1 0.08 1.06 0.08 1.06 -0.09 1.1 -0.09 1.1 0.08 1.06 -0.09 1.14 0.08 1.1 0.08 1.1 -0.09 1.14 -0.09 1.14 0.08 1.1 -0.09 
1.18 0.08 1.14 0.08 1.14 -0.09 1.18 -0.09 1.18 0.08 1.14 -0.09 1.22 0.08 1.19 0.08 1.18 -0.09 1.23 -0.09 1.22 0.08 1.18 -0.09 
1.27 0.08 1.23 0.08 1.23 -0.09 1.27 -0.09 1.27 0.08 1.23 -0.09 1.31 0.08 1.27 0.08 1.27 -0.09 1.31 -0.09 1.31 0.08 1.27 -0.09 
1.35 0.08 1.31 0.08 1.31 -0.09 1.35 -0.09 1.35 0.08 1.31 -0.09 1.39 0.08 1.35 0.08 1.35 -0.09 1.39 -0.09 1.39 0.08 1.35 -0.09 
1.43 0.08 1.4 0.08 1.39 -0.09 1.44 -0.09 1.43 0.08 1.39 -0.09 1.48 0.08 1.44 0.08 1.44 -0.09 1.48 -0.09 1.48 0.08 1.44 -0.09 
1.52 0.08 1.48 0.08 1.48 -0.09 1.52 -0.09 1.52 0.08 1.48 -0.09 1.56 0.08 1.52 0.08 1.52 -0.09 1.56 -0.09 1.56 0.08 1.52 -0.09 
1.6 0.08 1.56 0.08 1.56 -0.09 1.6 -0.09 1.6 0.08 1.56 -0.09 1.64 0.08 1.61 0.08 1.6 -0.09 1.65 -0.09 1.64 0.08 1.6 -0.09 
1.69 0.08 1.65 0.08 1.65 -0.09 1.69 -0.09 1.69 0.08 1.65 -0.09 1.73 0.08 1.69 0.08 1.69 -0.09 1.73 -0.09 1.73 0.08 1.69 -0.09 
1.77 0.08 1.73 0.08 1.73 -0.09 1.77 -0.09 1.77 0.08 1.73 -0.09 1.81 0.08 1.77 0.08 1.77 -0.09 1.81 -0.09 1.81 0.08 1.77 -0.09 
1.85 0.08 1.82 0.08 1.81 -0.09 1.87 0.07 1.86 0.07 1.81 -0.09 1.86 -0.09 1.87 0.08 1.81 -0.09 1.87 -0.09 1.87 0.08 1.86 -0.09 
0.04 -0.16 0.04 -0.16 0 -0.26 0.05 -0.26 0.04 -0.16 0 -0.26 0.09 -0.16 0.04 -0.16 0.05 -0.26 0.09 -0.26 0.09 -0.16 0.05 -0.26 
0.13 -0.16 0.09 -0.16 0.09 -0.26 0.13 -0.26 0.13 -0.16 0.09 -0.26 0.17 -0.16 0.13 -0.16 0.13 -0.26 0.17 -0.26 0.17 -0.16 0.13 -0.26 
0.21 -0.16 0.17 -0.16 0.17 -0.26 0.21 -0.26 0.21 -0.16 0.17 -0.26 0.25 -0.16 0.21 -0.16 0.21 -0.26 0.26 -0.26 0.25 -0.16 0.21 -0.26 
0.3 -0.16 0.25 -0.16 0.26 -0.26 0.3 -0.26 0.3 -0.16 0.26 -0.26 0.34 -0.16 0.3 -0.16 0.3 -0.26 0.34 -0.26 0.34 -0.16 0.3 -0.26 
0.38 -0.16 0.34 -0.16 0.34 -0.26 0.38 -0.26 0.38 -0.16 0.34 -0.26 0.42 -0.16 0.38 -0.16 0.38 -0.26 0.42 -0.26 0.42 -0.16 0.38 -0.26 
0.46 -0.16 0.42 -0.16 0.42 -0.26 0.47 -0.26 0.46 -0.16 0.42 -0.26 0.51 -0.16 0.46 -0.16 0.47 -0.26 0.51 -0.26 0.51 -0.16 0.47 -0.26 
0.55 -0.16 0.51 -0.16 0.51 -0.26 0.55 -0.26 0.55 -0.16 0.51 -0.26 0.59 -0.16 0.55 -0.16 0.55 -0.26 0.59 -0.26 0.59 -0.16 0.55 -0.26 
0.63 -0.16 0.59 -0.16 0.59 -0.26 0.63 -0.26 0.63 -0.16 0.59 -0.26 0.67 -0.16 0.63 -0.16 0.63 -0.26 0.68 -0.26 0.67 -0.16 0.63 -0.26 
0.72 -0.16 0.67 -0.16 0.68 -0.26 0.72 -0.26 0.72 -0.16 0.68 -0.26 0.76 -0.16 0.72 -0.16 0.72 -0.26 0.76 -0.26 0.76 -0.16 0.72 -0.26 
0.8 -0.16 0.76 -0.16 0.76 -0.26 0.8 -0.26 0.8 -0.16 0.76 -0.26 0.84 -0.16 0.8 -0.16 0.8 -0.26 0.84 -0.26 0.84 -0.16 0.8 -0.26 
0.88 -0.16 0.84 -0.16 0.84 -0.26 0.89 -0.26 0.88 -0.16 0.84 -0.26 0.93 -0.16 0.88 -0.16 0.89 -0.26 0.93 -0.26 0.93 -0.16 0.89 -0.26 
0.97 -0.16 0.93 -0.16 0.93 -0.26 0.97 -0.26 0.97 -0.16 0.93 -0.26 1.01 -0.16 0.97 -0.16 0.97 -0.26 1.01 -0.26 1.01 -0.16 0.97 -0.26 
1.05 -0.16 1.01 -0.16 1.01 -0.26 1.05 -0.26 1.05 -0.16 1.01 -0.26 1.09 -0.16 1.05 -0.16 1.05 -0.26 1.1 -0.26 1.09 -0.16 1.05 -0.26 
1.14 -0.16 1.09 -0.16 1.1 -0.26 1.14 -0.26 1.14 -0.16 1.1 -0.26 1.18 -0.16 1.14 -0.16 1.14 -0.26 1.18 -0.26 1.18 -0.16 1.14 -0.26 
1.22 -0.16 1.18 -0.16 1.18 -0.26 1.22 -0.26 1.22 -0.16 1.18 -0.26 1.26 -0.16 1.22 -0.16 1.22 -0.26 1.26 -0.26 1.26 -0.16 1.22 -0.26 
1.3 -0.16 1.26 -0.16 1.26 -0.26 1.31 -0.26 1.3 -0.16 1.26 -0.26 1.35 -0.16 1.3 -0.16 1.31 -0.26 1.35 -0.26 1.35 -0.16 1.31 -0.26 
1.39 -0.16 1.35 -0.16 1.35 -0.26 1.39 -0.26 1.39 -0.16 1.35 -0.26 1.43 -0.16 1.39 -0.16 1.39 -0.26 1.43 -0.26 1.43 -0.16 1.39 -0.26 
1.47 -0.16 1.43 -0.16 1.43 -0.26 1.47 -0.26 1.47 -0.16 1.43 -0.26 1.51 -0.16 1.47 -0.16 1.47 -0.26 1.52 -0.26 1.51 -0.16 1.47 -0.26 
1.56 -0.16 1.51 -0.16 1.52 -0.26 1.56 -0.26 1.56 -0.16 1.52 -0.26 1.6 -0.16 1.56 -0.16 1.56 -0.26 1.6 -0.26 1.6 -0.16 1.56 -0.26 
1.64 -0.16 1.6 -0.16 1.6 -0.26 1.64 -0.26 1.64 -0.16 1.6 -0.26 1.68 -0.16 1.64 -0.16 1.64 -0.26 1.68 -0.26 1.68 -0.16 1.64 -0.26 
1.72 -0.16 1.68 -0.16 1.68 -0.26 1.73 -0.26 1.72 -0.16 1.68 -0.26 1.77 -0.16 1.72 -0.16 1.73 -0.26 1.77 -0.26 1.77 -0.16 1.73 -0.26 
1.81 -0.16 1.77 -0.16 1.77 -0.26 1.81 -0.26 1.81 -0.16 1.77 -0.26 1.85 -0.16 1.81 -0.16 1.81 -0.26 1.85 -0.26 1.85 -0.16 1.81 -0.26 
1.89 -0.16 1.85 -0.16 1.85 -0.26 1.91 -0.16 1.89 -0.16 1.85 -0.26 1.89 -0.26 1.91 -0.16 1.85 -0.26 1.91 -0.26 1.91 -0.16 1.89 -0.26 
0.04 -0.36 0 -0.19 0 -0.36 0.05 -0.19 0 -0.19 0.04 -0.36 0.08 -0.36 0.04 -0.19 0.04 -0.36 0.08 -0.19 0.04 -0.19 0.08 -0.36 
0.12 -0.36 0.08 -0.19 0.08 -0.36 0.12 -0.19 0.08 -0.19 0.12 -0.36 0.16 -0.36 0.12 -0.19 0.12 -0.36 0.16 -0.19 0.12 -0.19 0.16 -0.36 
0.2 -0.36 0.16 -0.19 0.16 -0.36 0.2 -0.19 0.16 -0.19 0.2 -0.36 0.24 -0.36 0.2 -0.19 0.2 -0.36 0.24 -0.19 0.2 -0.19 0.24 -0.36 
0.28 -0.36 0.24 -0.19 0.24 -0.36 0.28 -0.19 0.24 -0.19 0.28 -0.36 0.32 -0.36 0.28 -0.19 0.28 -0.36 0.32 -0.19 0.28 -0.19 0.32 -0.36 
0.36 -0.36 0.32 -0.19 0.32 -0.36 0.36 -0.19 0.32 -0.19 0.36 -0.36 0.4 -0.36 0.36 -0.19 0.36 -0.36 0.4 -0.19 0.36 -0.19 0.4 -0.36 
0.44 -0.36 0.4 -0.19 0.4 -0.36 0.44 -0.19 0.4 -0.19 0.44 -0.36 0.48 -0.36 0.44 -0.19 0.44 -0.36 0.48 -0.19 0.44 -0.19 0.48 -0.36 
0.52 -0.36 0.47 -0.19 0.48 -0.36 0.52 -0.19 0.47 -0.19 0.52 -0.36 0.55 -0.36 0.51 -0.19 0.52 -0.36 0.56 -0.19 0.51 -0.19 0.55 -0.36 
0.59 -0.36 0.55 -0.19 0.55 -0.36 0.6 -0.19 0.55 -0.19 0.59 -0.36 0.63 -0.36 0.59 -0.19 0.59 -0.36 0.63 -0.19 0.59 -0.19 0.63 -0.36 
0.67 -0.36 0.63 -0.19 0.63 -0.36 0.67 -0.19 0.63 -0.19 0.67 -0.36 0.71 -0.36 0.67 -0.19 0.67 -0.36 0.71 -0.19 0.67 -0.19 0.71 -0.36 
0.75 -0.36 0.71 -0.19 0.71 -0.36 0.75 -0.19 0.71 -0.19 0.75 -0.36 0.79 -0.36 0.75 -0.19 0.75 -0.36 0.79 -0.19 0.75 -0.19 0.79 -0.36 
0.83 -0.36 0.79 -0.19 0.79 -0.36 0.83 -0.19 0.79 -0.19 0.83 -0.36 0.87 -0.36 0.83 -0.19 0.83 -0.36 0.87 -0.19 0.83 -0.19 0.87 -0.36 
0.91 -0.36 0.87 -0.19 0.87 -0.36 0.91 -0.19 0.87 -0.19 0.91 -0.36 0.95 -0.36 0.91 -0.19 0.91 -0.36 0.95 -0.19 0.91 -0.19 0.95 -0.36 
0.99 -0.36 0.95 -0.19 0.95 -0.36 0.99 -0.19 0.95 -0.19 0.99 -0.36 1.03 -0.36 0.99 -0.19 0.99 -0.36 1.03 -0.19 0.99 -0.19 1.03 -0.36 
1.07 -0.36 1.02 -0.19 1.03 -0.36 1.07 -0.19 1.02 -0.19 1.07 -0.36 1.1 -0.36 1.06 -0.19 1.07 -0.36 1.11 -0.19 1.06 -0.19 1.1 -0.36 
1.14 -0.36 1.1 -0.19 1.1 -0.36 1.15 -0.19 1.1 -0.19 1.14 -0.36 1.18 -0.36 1.14 -0.19 1.14 -0.36 1.18 -0.19 1.14 -0.19 1.18 -0.36 
1.22 -0.36 1.18 -0.19 1.18 -0.36 1.22 -0.19 1.18 -0.19 1.22 -0.36 1.26 -0.36 1.22 -0.19 1.22 -0.36 1.26 -0.19 1.22 -0.19 1.26 -0.36 
1.3 -0.36 1.26 -0.19 1.26 -0.36 1.3 -0.19 1.26 -0.19 1.3 -0.36 1.34 -0.36 1.3 -0.19 1.3 -0.36 1.34 -0.19 1.3 -0.19 1.34 -0.36 
1.38 -0.36 1.34 -0.19 1.34 -0.36 1.38 -0.19 1.34 -0.19 1.38 -0.36 1.42 -0.36 1.38 -0.19 1.38 -0.36 1.42 -0.19 1.38 -0.19 1.42 -0.36 
1.46 -0.36 1.42 -0.19 1.42 -0.36 1.46 -0.19 1.42 -0.19 1.46 -0.36 1.5 -0.36 1.46 -0.19 1.46 -0.36 1.5 -0.19 1.46 -0.19 1.5 -0.36 
1.54 -0.36 1.5 -0.19 1.5 -0.36 1.54 -0.19 1.5 -0.19 1.54 -0.36 1.58 -0.36 1.54 -0.19 1.54 -0.36 1.58 -0.19 1.54 -0.19 1.58 -0.36 
1.62 -0.36 1.57 -0.19 1.58 -0.36 1.62 -0.19 1.57 -0.19 1.62 -0.36 1.65 -0.36 1.61 -0.19 1.62 -0.36 1.66 -0.19 1.61 -0.19 1.65 -0.36 
1.69 -0.36 1.65 -0.19 1.65 -0.36 1.7 -0.19 1.65 -0.19 1.69 -0.36 1.73 -0.36 1.69 -0.19 1.69 -0.36 1.73 -0.19 1.69 -0.19 1.73 -0.36 
1.77 -0.36 1.73 -0.19 1.73 -0.36 1.79 -0.36 1.73 -0.19 1.77 -0.36 1.77 -0.19 1.73 -0.19 1.79 -0.36 1.79 -0.19 1.77 -0.19 1.79 -0.36 
0.01 -0.53 -0.03 -0.43 0 -0.53 0 -0.43 -0.03 -0.43 0.01 -0.53 0.04 -0.43 0 -0.43 0.01 -0.53 0.05 -0.53 0.04 -0.43 0.01 -0.53 
0.08 -0.43 0.04 -0.43 0.05 -0.53 0.09 -0.53 0.08 -0.43 0.05 -0.53 0.12 -0.43 0.08 -0.43 0.09 -0.53 0.13 -0.53 0.12 -0.43 0.09 -0.53 
0.16 -0.43 0.12 -0.43 0.13 -0.53 0.17 -0.53 0.16 -0.43 0.13 -0.53 0.2 -0.43 0.16 -0.43 0.17 -0.53 0.2 -0.53 0.2 -0.43 0.17 -0.53 
0.24 -0.43 0.2 -0.43 0.2 -0.53 0.24 -0.53 0.24 -0.43 0.2 -0.53 0.28 -0.43 0.24 -0.43 0.24 -0.53 0.28 -0.53 0.28 -0.43 0.24 -0.53 
0.32 -0.43 0.28 -0.43 0.28 -0.53 0.32 -0.53 0.32 -0.43 0.28 -0.53 0.36 -0.43 0.32 -0.43 0.32 -0.53 0.36 -0.53 0.36 -0.43 0.32 -0.53 
0.4 -0.43 0.36 -0.43 0.36 -0.53 0.4 -0.53 0.4 -0.43 0.36 -0.53 0.44 -0.43 0.4 -0.43 0.4 -0.53 0.44 -0.53 0.44 -0.43 0.4 -0.53 
0.48 -0.43 0.44 -0.43 0.44 -0.53 0.48 -0.53 0.48 -0.43 0.44 -0.53 0.52 -0.43 0.48 -0.43 0.48 -0.53 0.52 -0.53 0.52 -0.43 0.48 -0.53 
0.56 -0.43 0.52 -0.43 0.52 -0.53 0.56 -0.53 0.56 -0.43 0.52 -0.53 0.59 -0.43 0.56 -0.43 0.56 -0.53 0.6 -0.53 0.59 -0.43 0.56 -0.53 
0.63 -0.43 0.59 -0.43 0.6 -0.53 0.64 -0.53 0.63 -0.43 0.6 -0.53 0.67 -0.43 0.63 -0.43 0.64 -0.53 0.68 -0.53 0.67 -0.43 0.64 -0.53 
0.71 -0.43 0.67 -0.43 0.68 -0.53 0.72 -0.53 0.71 -0.43 0.68 -0.53 0.75 -0.43 0.71 -0.43 0.72 -0.53 0.75 -0.53 0.75 -0.43 0.72 -0.53 
0.79 -0.43 0.75 -0.43 0.75 -0.53 0.79 -0.53 0.79 -0.43 0.75 -0.53 0.83 -0.43 0.79 -0.43 0.79 -0.53 0.83 -0.53 0.83 -0.43 0.79 -0.53 
0.87 -0.43 0.83 -0.43 0.83 -0.53 0.87 -0.53 0.87 -0.43 0.83 -0.53 0.91 -0.43 0.87 -0.43 0.87 -0.53 0.91 -0.53 0.91 -0.43 0.87 -0.53 
0.95 -0.43 0.91 -0.43 0.91 -0.53 0.95 -0.53 0.95 -0.43 0.91 -0.53 0.99 -0.43 0.95 -0.43 0.95 -0.53 0.99 -0.53 0.99 -0.43 0.95 -0.53 
1.03 -0.43 0.99 -0.43 0.99 -0.53 1.03 -0.53 1.03 -0.43 0.99 -0.53 1.07 -0.43 1.03 -0.43 1.03 -0.53 1.07 -0.53 1.07 -0.43 1.03 -0.53 
1.11 -0.43 1.07 -0.43 1.07 -0.53 1.11 -0.53 1.11 -0.43 1.07 -0.53 1.14 -0.43 1.11 -0.43 1.11 -0.53 1.15 -0.53 1.14 -0.43 1.11 -0.53 
1.18 -0.43 1.14 -0.43 1.15 -0.53 1.19 -0.53 1.18 -0.43 1.15 -0.53 1.22 -0.43 1.18 -0.43 1.19 -0.53 1.23 -0.53 1.22 -0.43 1.19 -0.53 
1.26 -0.43 1.22 -0.43 1.23 -0.53 1.26 -0.53 1.26 -0.43 1.23 -0.53 1.3 -0.43 1.26 -0.43 1.26 -0.53 1.3 -0.53 1.3 -0.43 1.26 -0.53 
1.34 -0.43 1.3 -0.43 1.3 -0.53 1.34 -0.53 1.34 -0.43 1.3 -0.53 1.38 -0.43 1.34 -0.43 1.34 -0.53 1.38 -0.53 1.38 -0.43 1.34 -0.53 
1.42 -0.43 1.38 -0.43 1.38 -0.53 1.42 -0.53 1.42 -0.43 1.38 -0.53 1.46 -0.43 1.42 -0.43 1.42 -0.53 1.46 -0.53 1.46 -0.43 1.42 -0.53 
1.5 -0.43 1.46 -0.43 1.46 -0.53 1.5 -0.53 1.5 -0.43 1.46 -0.53 1.54 -0.43 1.5 -0.43 1.5 -0.53 1.54 -0.53 1.54 -0.43 1.5 -0.53 
1.58 -0.43 1.54 -0.43 1.54 -0.53 1.58 -0.53 1.58 -0.43 1.54 -0.53 1.62 -0.43 1.58 -0.43 1.58 -0.53 1.62 -0.53 1.62 -0.43 1.58 -0.53 
1.66 -0.43 1.62 -0.43 1.62 -0.53 1.66 -0.53 1.66 -0.43 1.62 -0.53 1.69 -0.43 1.66 -0.43 1.66 -0.53 1.7 -0.53 1.69 -0.43 1.66 -0.53 
1.73 -0.43 1.69 -0.43 1.7 -0.53 1.75 -0.43 1.73 -0.43 1.7 -0.53 1.74 -0.53 1.75 -0.43 1.7 -0.53 1.75 -0.53 1.75 -0.43 1.74 -0.53 
0.12 0 0 0 0 -0.11 0.12 -0.11 0.07 0 0 0 0 -0.16 0.07 -0.16"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="handrailTex"></texture>
                    <material is="x3d" use="handrailMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 3 0 2 -1 4 3 2 -1 5 3 4 -1 
6 5 4 -1 7 5 6 -1 8 7 6 -1 9 7 8 -1 
10 9 8 -1 11 9 10 -1 12 11 10 -1 13 11 12 -1 
14 13 12 -1 15 13 14 -1 16 15 14 -1 17 15 16 -1 
18 17 16 -1 19 17 18 -1 20 19 18 -1 21 19 20 -1 
22 21 20 -1 23 21 22 -1 24 23 22 -1 25 23 24 -1 
26 25 24 -1 27 25 26 -1 28 27 26 -1 29 27 28 -1 
30 29 28 -1 31 29 30 -1 32 31 30 -1 33 31 32 -1 
34 33 32 -1 35 33 34 -1 36 35 34 -1 37 35 36 -1 
38 37 36 -1 39 37 38 -1 40 39 38 -1 41 39 40 -1 
42 41 40 -1 43 41 42 -1 44 43 42 -1 45 43 44 -1 
46 45 44 -1 47 45 46 -1 48 47 46 -1 49 47 48 -1 
50 49 48 -1 51 49 50 -1 52 51 50 -1 53 51 52 -1 
54 53 52 -1 55 53 54 -1 56 55 54 -1 57 55 56 -1 
58 57 56 -1 59 57 58 -1 60 59 58 -1 61 59 60 -1 
62 61 60 -1 63 61 62 -1 64 63 62 -1 65 63 64 -1 
66 65 64 -1 67 65 66 -1 68 67 66 -1 69 67 68 -1 
70 69 68 -1 71 69 70 -1 72 71 70 -1 73 71 72 -1 
74 73 72 -1 75 73 74 -1 76 75 74 -1 77 75 76 -1 
78 77 76 -1 79 77 78 -1 80 79 78 -1 81 79 80 -1 
82 81 80 -1 83 81 82 -1 84 83 82 -1 85 83 84 -1 
86 85 84 -1 87 85 86 -1 88 87 86 -1 89 87 88 -1 
90 89 88 -1 91 89 90 -1 92 91 90 -1 93 92 90 -1 
94 92 93 -1 4 2 95 -1 96 4 95 -1 6 4 96 -1 
97 6 96 -1 8 6 97 -1 98 8 97 -1 10 8 98 -1 
99 10 98 -1 12 10 99 -1 100 12 99 -1 14 12 100 -1 
101 14 100 -1 16 14 101 -1 102 16 101 -1 18 16 102 -1 
103 18 102 -1 20 18 103 -1 104 20 103 -1 22 20 104 -1 
105 22 104 -1 24 22 105 -1 106 24 105 -1 26 24 106 -1 
107 26 106 -1 28 26 107 -1 108 28 107 -1 30 28 108 -1 
109 30 108 -1 32 30 109 -1 110 32 109 -1 34 32 110 -1 
111 34 110 -1 36 34 111 -1 112 36 111 -1 38 36 112 -1 
113 38 112 -1 40 38 113 -1 114 40 113 -1 42 40 114 -1 
115 42 114 -1 44 42 115 -1 116 44 115 -1 46 44 116 -1 
117 46 116 -1 48 46 117 -1 118 48 117 -1 50 48 118 -1 
119 50 118 -1 52 50 119 -1 120 52 119 -1 54 52 120 -1 
121 54 120 -1 56 54 121 -1 122 56 121 -1 58 56 122 -1 
123 58 122 -1 60 58 123 -1 124 60 123 -1 62 60 124 -1 
125 62 124 -1 64 62 125 -1 126 64 125 -1 66 64 126 -1 
127 66 126 -1 68 66 127 -1 128 68 127 -1 70 68 128 -1 
129 70 128 -1 72 70 129 -1 130 72 129 -1 74 72 130 -1 
131 74 130 -1 76 74 131 -1 132 76 131 -1 78 76 132 -1 
133 78 132 -1 80 78 133 -1 134 80 133 -1 82 80 134 -1 
135 82 134 -1 84 82 135 -1 136 84 135 -1 86 84 136 -1 
137 86 136 -1 88 86 137 -1 138 88 137 -1 90 88 138 -1 
139 90 138 -1 93 90 139 -1 94 93 139 -1 140 94 139 -1 
141 94 140 -1 142 95 143 -1 96 95 142 -1 144 96 142 -1 
97 96 144 -1 145 97 144 -1 98 97 145 -1 146 98 145 -1 
99 98 146 -1 147 99 146 -1 100 99 147 -1 148 100 147 -1 
101 100 148 -1 149 101 148 -1 102 101 149 -1 150 102 149 -1 
103 102 150 -1 151 103 150 -1 104 103 151 -1 152 104 151 -1 
105 104 152 -1 153 105 152 -1 106 105 153 -1 154 106 153 -1 
107 106 154 -1 155 107 154 -1 108 107 155 -1 156 108 155 -1 
109 108 156 -1 157 109 156 -1 110 109 157 -1 158 110 157 -1 
111 110 158 -1 159 111 158 -1 112 111 159 -1 160 112 159 -1 
113 112 160 -1 161 113 160 -1 114 113 161 -1 162 114 161 -1 
115 114 162 -1 163 115 162 -1 116 115 163 -1 164 116 163 -1 
117 116 164 -1 165 117 164 -1 118 117 165 -1 166 118 165 -1 
119 118 166 -1 167 119 166 -1 120 119 167 -1 168 120 167 -1 
121 120 168 -1 169 121 168 -1 122 121 169 -1 170 122 169 -1 
123 122 170 -1 171 123 170 -1 124 123 171 -1 172 124 171 -1 
125 124 172 -1 173 125 172 -1 126 125 173 -1 174 126 173 -1 
127 126 174 -1 175 127 174 -1 128 127 175 -1 176 128 175 -1 
129 128 176 -1 177 129 176 -1 130 129 177 -1 178 130 177 -1 
131 130 178 -1 179 131 178 -1 132 131 179 -1 180 132 179 -1 
133 132 180 -1 181 133 180 -1 134 133 181 -1 182 134 181 -1 
135 134 182 -1 183 135 182 -1 136 135 183 -1 184 136 183 -1 
137 136 184 -1 185 137 184 -1 138 137 185 -1 186 138 185 -1 
139 138 186 -1 187 139 186 -1 188 139 187 -1 140 139 188 -1 
141 140 188 -1 0 143 1 -1 142 143 0 -1 3 142 0 -1 
144 142 3 -1 5 144 3 -1 145 144 5 -1 7 145 5 -1 
146 145 7 -1 9 146 7 -1 147 146 9 -1 11 147 9 -1 
148 147 11 -1 13 148 11 -1 149 148 13 -1 15 149 13 -1 
150 149 15 -1 17 150 15 -1 151 150 17 -1 19 151 17 -1 
152 151 19 -1 21 152 19 -1 153 152 21 -1 23 153 21 -1 
154 153 23 -1 25 154 23 -1 155 154 25 -1 27 155 25 -1 
156 155 27 -1 29 156 27 -1 157 156 29 -1 31 157 29 -1 
158 157 31 -1 33 158 31 -1 159 158 33 -1 35 159 33 -1 
160 159 35 -1 37 160 35 -1 161 160 37 -1 39 161 37 -1 
162 161 39 -1 41 162 39 -1 163 162 41 -1 43 163 41 -1 
164 163 43 -1 45 164 43 -1 165 164 45 -1 47 165 45 -1 
166 165 47 -1 49 166 47 -1 167 166 49 -1 51 167 49 -1 
168 167 51 -1 53 168 51 -1 169 168 53 -1 55 169 53 -1 
170 169 55 -1 57 170 55 -1 171 170 57 -1 59 171 57 -1 
172 171 59 -1 61 172 59 -1 173 172 61 -1 63 173 61 -1 
174 173 63 -1 65 174 63 -1 175 174 65 -1 67 175 65 -1 
176 175 67 -1 69 176 67 -1 177 176 69 -1 71 177 69 -1 
178 177 71 -1 73 178 71 -1 179 178 73 -1 75 179 73 -1 
180 179 75 -1 77 180 75 -1 181 180 77 -1 79 181 77 -1 
182 181 79 -1 81 182 79 -1 183 182 81 -1 83 183 81 -1 
184 183 83 -1 85 184 83 -1 185 184 85 -1 87 185 85 -1 
186 185 87 -1 89 186 87 -1 187 186 89 -1 188 187 89 -1 
91 188 89 -1 92 188 91 -1 143 95 2 1 -1 94 141 188 92 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 -1 6 7 8 -1 9 10 11 -1 
12 13 14 -1 15 16 17 -1 18 19 20 -1 21 22 23 -1 
24 25 26 -1 27 28 29 -1 30 31 32 -1 33 34 35 -1 
36 37 38 -1 39 40 41 -1 42 43 44 -1 45 46 47 -1 
48 49 50 -1 51 52 53 -1 54 55 56 -1 57 58 59 -1 
60 61 62 -1 63 64 65 -1 66 67 68 -1 69 70 71 -1 
72 73 74 -1 75 76 77 -1 78 79 80 -1 81 82 83 -1 
84 85 86 -1 87 88 89 -1 90 91 92 -1 93 94 95 -1 
96 97 98 -1 99 100 101 -1 102 103 104 -1 105 106 107 -1 
108 109 110 -1 111 112 113 -1 114 115 116 -1 117 118 119 -1 
120 121 122 -1 123 124 125 -1 126 127 128 -1 129 130 131 -1 
132 133 134 -1 135 136 137 -1 138 139 140 -1 141 142 143 -1 
144 145 146 -1 147 148 149 -1 150 151 152 -1 153 154 155 -1 
156 157 158 -1 159 160 161 -1 162 163 164 -1 165 166 167 -1 
168 169 170 -1 171 172 173 -1 174 175 176 -1 177 178 179 -1 
180 181 182 -1 183 184 185 -1 186 187 188 -1 189 190 191 -1 
192 193 194 -1 195 196 197 -1 198 199 200 -1 201 202 203 -1 
204 205 206 -1 207 208 209 -1 210 211 212 -1 213 214 215 -1 
216 217 218 -1 219 220 221 -1 222 223 224 -1 225 226 227 -1 
228 229 230 -1 231 232 233 -1 234 235 236 -1 237 238 239 -1 
240 241 242 -1 243 244 245 -1 246 247 248 -1 249 250 251 -1 
252 253 254 -1 255 256 257 -1 258 259 260 -1 261 262 263 -1 
264 265 266 -1 267 268 269 -1 270 271 272 -1 273 274 275 -1 
276 277 278 -1 279 280 281 -1 282 283 284 -1 285 286 287 -1 
288 289 290 -1 291 292 293 -1 294 295 296 -1 297 298 299 -1 
300 301 302 -1 303 304 305 -1 306 307 308 -1 309 310 311 -1 
312 313 314 -1 315 316 317 -1 318 319 320 -1 321 322 323 -1 
324 325 326 -1 327 328 329 -1 330 331 332 -1 333 334 335 -1 
336 337 338 -1 339 340 341 -1 342 343 344 -1 345 346 347 -1 
348 349 350 -1 351 352 353 -1 354 355 356 -1 357 358 359 -1 
360 361 362 -1 363 364 365 -1 366 367 368 -1 369 370 371 -1 
372 373 374 -1 375 376 377 -1 378 379 380 -1 381 382 383 -1 
384 385 386 -1 387 388 389 -1 390 391 392 -1 393 394 395 -1 
396 397 398 -1 399 400 401 -1 402 403 404 -1 405 406 407 -1 
408 409 410 -1 411 412 413 -1 414 415 416 -1 417 418 419 -1 
420 421 422 -1 423 424 425 -1 426 427 428 -1 429 430 431 -1 
432 433 434 -1 435 436 437 -1 438 439 440 -1 441 442 443 -1 
444 445 446 -1 447 448 449 -1 450 451 452 -1 453 454 455 -1 
456 457 458 -1 459 460 461 -1 462 463 464 -1 465 466 467 -1 
468 469 470 -1 471 472 473 -1 474 475 476 -1 477 478 479 -1 
480 481 482 -1 483 484 485 -1 486 487 488 -1 489 490 491 -1 
492 493 494 -1 495 496 497 -1 498 499 500 -1 501 502 503 -1 
504 505 506 -1 507 508 509 -1 510 511 512 -1 513 514 515 -1 
516 517 518 -1 519 520 521 -1 522 523 524 -1 525 526 527 -1 
528 529 530 -1 531 532 533 -1 534 535 536 -1 537 538 539 -1 
540 541 542 -1 543 544 545 -1 546 547 548 -1 549 550 551 -1 
552 553 554 -1 555 556 557 -1 558 559 560 -1 561 562 563 -1 
564 565 566 -1 567 568 569 -1 570 571 572 -1 573 574 575 -1 
576 577 578 -1 579 580 581 -1 582 583 584 -1 585 586 587 -1 
588 589 590 -1 591 592 593 -1 594 595 596 -1 597 598 599 -1 
600 601 602 -1 603 604 605 -1 606 607 608 -1 609 610 611 -1 
612 613 614 -1 615 616 617 -1 618 619 620 -1 621 622 623 -1 
624 625 626 -1 627 628 629 -1 630 631 632 -1 633 634 635 -1 
636 637 638 -1 639 640 641 -1 642 643 644 -1 645 646 647 -1 
648 649 650 -1 651 652 653 -1 654 655 656 -1 657 658 659 -1 
660 661 662 -1 663 664 665 -1 666 667 668 -1 669 670 671 -1 
672 673 674 -1 675 676 677 -1 678 679 680 -1 681 682 683 -1 
684 685 686 -1 687 688 689 -1 690 691 692 -1 693 694 695 -1 
696 697 698 -1 699 700 701 -1 702 703 704 -1 705 706 707 -1 
708 709 710 -1 711 712 713 -1 714 715 716 -1 717 718 719 -1 
720 721 722 -1 723 724 725 -1 726 727 728 -1 729 730 731 -1 
732 733 734 -1 735 736 737 -1 738 739 740 -1 741 742 743 -1 
744 745 746 -1 747 748 749 -1 750 751 752 -1 753 754 755 -1 
756 757 758 -1 759 760 761 -1 762 763 764 -1 765 766 767 -1 
768 769 770 -1 771 772 773 -1 774 775 776 -1 777 778 779 -1 
780 781 782 -1 783 784 785 -1 786 787 788 -1 789 790 791 -1 
792 793 794 -1 795 796 797 -1 798 799 800 -1 801 802 803 -1 
804 805 806 -1 807 808 809 -1 810 811 812 -1 813 814 815 -1 
816 817 818 -1 819 820 821 -1 822 823 824 -1 825 826 827 -1 
828 829 830 -1 831 832 833 -1 834 835 836 -1 837 838 839 -1 
840 841 842 -1 843 844 845 -1 846 847 848 -1 849 850 851 -1 
852 853 854 -1 855 856 857 -1 858 859 860 -1 861 862 863 -1 
864 865 866 -1 867 868 869 -1 870 871 872 -1 873 874 875 -1 
876 877 878 -1 879 880 881 -1 882 883 884 -1 885 886 887 -1 
888 889 890 -1 891 892 893 -1 894 895 896 -1 897 898 899 -1 
900 901 902 -1 903 904 905 -1 906 907 908 -1 909 910 911 -1 
912 913 914 -1 915 916 917 -1 918 919 920 -1 921 922 923 -1 
924 925 926 -1 927 928 929 -1 930 931 932 -1 933 934 935 -1 
936 937 938 -1 939 940 941 -1 942 943 944 -1 945 946 947 -1 
948 949 950 -1 951 952 953 -1 954 955 956 -1 957 958 959 -1 
960 961 962 -1 963 964 965 -1 966 967 968 -1 969 970 971 -1 
972 973 974 -1 975 976 977 -1 978 979 980 -1 981 982 983 -1 
984 985 986 -1 987 988 989 -1 990 991 992 -1 993 994 995 -1 
996 997 998 -1 999 1000 1001 -1 1002 1003 1004 -1 1005 1006 1007 -1 
1008 1009 1010 -1 1011 1012 1013 -1 1014 1015 1016 -1 1017 1018 1019 -1 
1020 1021 1022 -1 1023 1024 1025 -1 1026 1027 1028 -1 1029 1030 1031 -1 
1032 1033 1034 -1 1035 1036 1037 -1 1038 1039 1040 -1 1041 1042 1043 -1 
1044 1045 1046 -1 1047 1048 1049 -1 1050 1051 1052 -1 1053 1054 1055 -1 
1056 1057 1058 -1 1059 1060 1061 -1 1062 1063 1064 -1 1065 1066 1067 -1 
1068 1069 1070 -1 1071 1072 1073 -1 1074 1075 1076 -1 1077 1078 1079 -1 
1080 1081 1082 -1 1083 1084 1085 -1 1086 1087 1088 -1 1089 1090 1091 -1 
1092 1093 1094 -1 1095 1096 1097 -1 1098 1099 1100 -1 1101 1102 1103 -1 
1104 1105 1106 -1 1107 1108 1109 -1 1110 1111 1112 1113 -1 1114 1115 1116 1117 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 69.21 135.65 -20.55 69.17 135.73 -20.67 75.56 135.65 -22.58 69.79 134.43 -18.62
 76.2 134.43 -20.46 70.32 133.2 -16.68 76.78 133.2 -18.34 70.79 131.97 -14.72
 77.29 131.97 -16.2 71.21 130.75 -12.75 77.75 130.75 -14.05 71.57 129.52 -10.77
 78.15 129.52 -11.88 71.88 128.3 -8.79 78.48 128.3 -9.7 72.13 127.07 -6.79
 78.75 127.07 -7.52 72.32 125.85 -4.78 78.96 125.85 -5.33 72.45 124.62 -2.78
 79.11 124.62 -3.13 72.53 123.39 -0.76 79.2 123.39 -0.93 72.55 122.17 1.25
 79.22 122.17 1.27 72.52 120.94 3.26 79.18 120.94 3.47 72.42 119.72 5.27
 79.08 119.72 5.67 72.27 118.49 7.28 78.92 118.49 7.87 72.07 117.27 9.28
 78.69 117.27 10.06 71.8 116.04 11.28 78.4 116.04 12.24 71.48 114.81 13.26
 78.05 114.81 14.42 71.11 113.59 15.24 77.64 113.59 16.58 70.68 112.36 17.21
 77.17 112.36 18.73 70.19 111.14 19.16 76.63 111.14 20.87 69.65 109.91 21.1
 76.04 109.91 22.99 69.05 108.69 23.02 75.39 108.69 25.09 68.4 107.46 24.92
 74.67 107.46 27.17 67.69 106.23 26.81 73.9 106.23 29.23 66.93 105.01 28.67
 73.07 105.01 31.27 66.12 103.78 30.52 72.18 103.78 33.29 65.26 102.56 32.33
 71.24 102.56 35.28 64.34 101.33 34.13 70.24 101.33 37.24 63.38 100.11 35.89
 69.18 100.11 39.17 62.36 98.88 37.63 68.07 98.88 41.07 61.3 97.65 39.34
 66.91 97.65 42.94 60.19 96.43 41.02 65.69 96.43 44.78 59.03 95.2 42.66
 64.43 95.2 46.58 57.82 93.98 44.28 63.11 93.98 48.34 56.57 92.75 45.85
 61.74 92.75 50.07 55.28 91.53 47.4 60.32 91.53 51.76 53.94 90.3 48.9
 58.86 90.3 53.4 52.56 89.07 50.36 57.35 89.07 55 51.14 87.85 51.79
 55.8 87.85 56.56 49.68 86.62 53.18 54.2 86.62 58.08 48.18 85.4 54.52
 52.56 85.4 59.55 46.64 84.17 55.82 50.88 84.17 60.97 45.07 82.95 57.07
 49.16 82.95 62.34 43.46 81.72 58.28 47.4 81.72 63.67 41.82 80.49 59.45
 41.22 80.05 59.86 45.6 80.49 64.94 44.83 79.98 65.46 76.15 138.98 -20.63
 76.73 137.76 -18.51 77.25 136.53 -16.37 77.72 135.31 -14.22 78.12 134.08 -12.05
 78.46 132.86 -9.88 78.73 131.63 -7.69 78.95 130.4 -5.5 79.1 129.18 -3.31
 79.19 127.95 -1.11 79.22 126.73 1.1 79.19 125.5 3.3 79.09 124.28 5.5
 78.93 123.05 7.69 78.71 121.82 9.88 78.43 120.6 12.07 78.08 119.37 14.24
 77.68 118.15 16.41 77.21 116.92 18.56 76.68 115.7 20.7 76.09 114.47 22.82
 75.44 113.24 24.92 74.73 112.02 27.01 73.97 110.79 29.07 73.14 109.57 31.11
 72.26 108.34 33.13 71.32 107.12 35.12 70.32 105.89 37.08 69.27 104.66 39.02
 68.16 103.44 40.92 67 102.21 42.8 65.79 100.99 44.63 64.53 99.76 46.44
 63.21 98.54 48.2 61.85 97.31 49.93 60.44 96.08 51.62 58.98 94.86 53.27
 57.47 93.63 54.88 55.92 92.41 56.44 54.33 91.18 57.96 52.69 89.96 59.43
 51.01 88.73 60.86 49.29 87.5 62.23 47.54 86.28 63.56 45.75 85.05 64.84
 43.92 83.83 66.07 43.13 83.31 66.57 70.28 137.76 -16.84 69.74 138.98 -18.78
 70.76 136.53 -14.88 71.18 135.31 -12.91 71.54 134.08 -10.93 71.85 132.86 -8.94
 72.11 131.63 -6.95 72.31 130.4 -4.94 72.45 129.18 -2.94 72.53 127.95 -0.93
 72.55 126.73 1.09 72.52 125.5 3.1 72.43 124.28 5.11 72.29 123.05 7.12
 72.09 121.82 9.12 71.83 120.6 11.12 71.51 119.37 13.1 71.14 118.15 15.08
 70.71 116.92 17.05 70.23 115.7 19 69.69 114.47 20.94 69.1 113.24 22.87
 68.45 112.02 24.77 67.75 110.79 26.66 66.99 109.57 28.52 66.19 108.34 30.37
 65.33 107.12 32.19 64.42 105.89 33.98 63.46 104.66 35.75 62.45 103.44 37.49
 61.39 102.21 39.2 60.28 100.99 40.89 59.12 99.76 42.53 57.92 98.54 44.15
 56.68 97.31 45.73 55.38 96.08 47.27 54.05 94.86 48.78 52.67 93.63 50.25
 51.26 92.41 51.68 49.8 91.18 53.07 48.3 89.96 54.41 46.77 88.73 55.72
 45.2 87.5 56.97 43.59 86.28 58.19 41.95 85.05 59.36 40.28 83.83 60.48
 39.56 83.31 60.94"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0.08 0 0.08 0 -0.09 0.05 0.08 0.01 0.08 0 -0.09 0.05 -0.09 0.05 0.08 0 -0.09 0.09 0.08 0.05 0.08 0.05 -0.09 
0.09 -0.09 0.09 0.08 0.05 -0.09 0.13 0.08 0.09 0.08 0.09 -0.09 0.13 -0.09 0.13 0.08 0.09 -0.09 0.17 0.08 0.13 0.08 0.13 -0.09 
0.17 -0.09 0.17 0.08 0.13 -0.09 0.21 0.08 0.17 0.08 0.17 -0.09 0.21 -0.09 0.21 0.08 0.17 -0.09 0.26 0.08 0.22 0.08 0.21 -0.09 
0.26 -0.09 0.26 0.08 0.21 -0.09 0.3 0.08 0.26 0.08 0.26 -0.09 0.3 -0.09 0.3 0.08 0.26 -0.09 0.34 0.08 0.3 0.08 0.3 -0.09 
0.34 -0.09 0.34 0.08 0.3 -0.09 0.38 0.08 0.34 0.08 0.34 -0.09 0.38 -0.09 0.38 0.08 0.34 -0.09 0.42 0.08 0.38 0.08 0.38 -0.09 
0.42 -0.09 0.42 0.08 0.38 -0.09 0.47 0.08 0.43 0.08 0.42 -0.09 0.47 -0.09 0.47 0.08 0.42 -0.09 0.51 0.08 0.47 0.08 0.47 -0.09 
0.51 -0.09 0.51 0.08 0.47 -0.09 0.55 0.08 0.51 0.08 0.51 -0.09 0.55 -0.09 0.55 0.08 0.51 -0.09 0.59 0.08 0.55 0.08 0.55 -0.09 
0.59 -0.09 0.59 0.08 0.55 -0.09 0.63 0.08 0.59 0.08 0.59 -0.09 0.63 -0.09 0.63 0.08 0.59 -0.09 0.68 0.08 0.64 0.08 0.63 -0.09 
0.68 -0.09 0.68 0.08 0.63 -0.09 0.72 0.08 0.68 0.08 0.68 -0.09 0.72 -0.09 0.72 0.08 0.68 -0.09 0.76 0.08 0.72 0.08 0.72 -0.09 
0.76 -0.09 0.76 0.08 0.72 -0.09 0.8 0.08 0.76 0.08 0.76 -0.09 0.8 -0.09 0.8 0.08 0.76 -0.09 0.84 0.08 0.8 0.08 0.8 -0.09 
0.84 -0.09 0.84 0.08 0.8 -0.09 0.89 0.08 0.85 0.08 0.84 -0.09 0.89 -0.09 0.89 0.08 0.84 -0.09 0.93 0.08 0.89 0.08 0.89 -0.09 
0.93 -0.09 0.93 0.08 0.89 -0.09 0.97 0.08 0.93 0.08 0.93 -0.09 0.97 -0.09 0.97 0.08 0.93 -0.09 1.01 0.08 0.97 0.08 0.97 -0.09 
1.01 -0.09 1.01 0.08 0.97 -0.09 1.05 0.08 1.01 0.08 1.01 -0.09 1.06 -0.09 1.05 0.08 1.01 -0.09 1.1 0.08 1.06 0.08 1.06 -0.09 
1.1 -0.09 1.1 0.08 1.06 -0.09 1.14 0.08 1.1 0.08 1.1 -0.09 1.14 -0.09 1.14 0.08 1.1 -0.09 1.18 0.08 1.14 0.08 1.14 -0.09 
1.18 -0.09 1.18 0.08 1.14 -0.09 1.22 0.08 1.18 0.08 1.18 -0.09 1.22 -0.09 1.22 0.08 1.18 -0.09 1.26 0.08 1.22 0.08 1.22 -0.09 
1.27 -0.09 1.26 0.08 1.22 -0.09 1.31 0.08 1.27 0.08 1.27 -0.09 1.31 -0.09 1.31 0.08 1.27 -0.09 1.35 0.08 1.31 0.08 1.31 -0.09 
1.35 -0.09 1.35 0.08 1.31 -0.09 1.39 0.08 1.35 0.08 1.35 -0.09 1.39 -0.09 1.39 0.08 1.35 -0.09 1.43 0.08 1.39 0.08 1.39 -0.09 
1.43 -0.09 1.43 0.08 1.39 -0.09 1.47 0.08 1.43 0.08 1.43 -0.09 1.48 -0.09 1.47 0.08 1.43 -0.09 1.52 0.08 1.48 0.08 1.48 -0.09 
1.52 -0.09 1.52 0.08 1.48 -0.09 1.56 0.08 1.52 0.08 1.52 -0.09 1.56 -0.09 1.56 0.08 1.52 -0.09 1.6 0.08 1.56 0.08 1.56 -0.09 
1.6 -0.09 1.6 0.08 1.56 -0.09 1.64 0.08 1.6 0.08 1.6 -0.09 1.64 -0.09 1.64 0.08 1.6 -0.09 1.68 0.08 1.64 0.08 1.64 -0.09 
1.69 -0.09 1.68 0.08 1.64 -0.09 1.73 0.08 1.69 0.08 1.69 -0.09 1.73 -0.09 1.73 0.08 1.69 -0.09 1.77 0.08 1.73 0.08 1.73 -0.09 
1.77 -0.09 1.77 0.08 1.73 -0.09 1.81 0.08 1.77 0.08 1.77 -0.09 1.81 -0.09 1.81 0.08 1.77 -0.09 1.85 0.08 1.81 0.08 1.81 -0.09 
1.85 -0.09 1.85 0.08 1.81 -0.09 1.89 0.08 1.85 0.08 1.85 -0.09 1.91 0.07 1.9 0.07 1.85 -0.09 1.9 -0.09 1.91 0.08 1.85 -0.09 
1.91 -0.09 1.91 0.08 1.9 -0.09 0.04 -0.16 0 -0.16 0 -0.26 0.05 -0.26 0.04 -0.16 0 -0.26 0.09 -0.16 0.04 -0.16 0.05 -0.26 
0.09 -0.26 0.09 -0.16 0.05 -0.26 0.13 -0.16 0.09 -0.16 0.09 -0.26 0.13 -0.26 0.13 -0.16 0.09 -0.26 0.17 -0.16 0.13 -0.16 0.13 -0.26 
0.17 -0.26 0.17 -0.16 0.13 -0.26 0.21 -0.16 0.17 -0.16 0.17 -0.26 0.21 -0.26 0.21 -0.16 0.17 -0.26 0.25 -0.16 0.21 -0.16 0.21 -0.26 
0.26 -0.26 0.25 -0.16 0.21 -0.26 0.3 -0.16 0.25 -0.16 0.26 -0.26 0.3 -0.26 0.3 -0.16 0.26 -0.26 0.34 -0.16 0.3 -0.16 0.3 -0.26 
0.34 -0.26 0.34 -0.16 0.3 -0.26 0.38 -0.16 0.34 -0.16 0.34 -0.26 0.38 -0.26 0.38 -0.16 0.34 -0.26 0.42 -0.16 0.38 -0.16 0.38 -0.26 
0.42 -0.26 0.42 -0.16 0.38 -0.26 0.46 -0.16 0.42 -0.16 0.42 -0.26 0.47 -0.26 0.46 -0.16 0.42 -0.26 0.51 -0.16 0.46 -0.16 0.47 -0.26 
0.51 -0.26 0.51 -0.16 0.47 -0.26 0.55 -0.16 0.51 -0.16 0.51 -0.26 0.55 -0.26 0.55 -0.16 0.51 -0.26 0.59 -0.16 0.55 -0.16 0.55 -0.26 
0.59 -0.26 0.59 -0.16 0.55 -0.26 0.63 -0.16 0.59 -0.16 0.59 -0.26 0.63 -0.26 0.63 -0.16 0.59 -0.26 0.67 -0.16 0.63 -0.16 0.63 -0.26 
0.68 -0.26 0.67 -0.16 0.63 -0.26 0.72 -0.16 0.67 -0.16 0.68 -0.26 0.72 -0.26 0.72 -0.16 0.68 -0.26 0.76 -0.16 0.72 -0.16 0.72 -0.26 
0.76 -0.26 0.76 -0.16 0.72 -0.26 0.8 -0.16 0.76 -0.16 0.76 -0.26 0.8 -0.26 0.8 -0.16 0.76 -0.26 0.84 -0.16 0.8 -0.16 0.8 -0.26 
0.84 -0.26 0.84 -0.16 0.8 -0.26 0.88 -0.16 0.84 -0.16 0.84 -0.26 0.89 -0.26 0.88 -0.16 0.84 -0.26 0.93 -0.16 0.88 -0.16 0.89 -0.26 
0.93 -0.26 0.93 -0.16 0.89 -0.26 0.97 -0.16 0.93 -0.16 0.93 -0.26 0.97 -0.26 0.97 -0.16 0.93 -0.26 1.01 -0.16 0.97 -0.16 0.97 -0.26 
1.01 -0.26 1.01 -0.16 0.97 -0.26 1.05 -0.16 1.01 -0.16 1.01 -0.26 1.05 -0.26 1.05 -0.16 1.01 -0.26 1.09 -0.16 1.05 -0.16 1.05 -0.26 
1.1 -0.26 1.09 -0.16 1.05 -0.26 1.14 -0.16 1.09 -0.16 1.1 -0.26 1.14 -0.26 1.14 -0.16 1.1 -0.26 1.18 -0.16 1.14 -0.16 1.14 -0.26 
1.18 -0.26 1.18 -0.16 1.14 -0.26 1.22 -0.16 1.18 -0.16 1.18 -0.26 1.22 -0.26 1.22 -0.16 1.18 -0.26 1.26 -0.16 1.22 -0.16 1.22 -0.26 
1.26 -0.26 1.26 -0.16 1.22 -0.26 1.3 -0.16 1.26 -0.16 1.26 -0.26 1.31 -0.26 1.3 -0.16 1.26 -0.26 1.35 -0.16 1.3 -0.16 1.31 -0.26 
1.35 -0.26 1.35 -0.16 1.31 -0.26 1.39 -0.16 1.35 -0.16 1.35 -0.26 1.39 -0.26 1.39 -0.16 1.35 -0.26 1.43 -0.16 1.39 -0.16 1.39 -0.26 
1.43 -0.26 1.43 -0.16 1.39 -0.26 1.47 -0.16 1.43 -0.16 1.43 -0.26 1.47 -0.26 1.47 -0.16 1.43 -0.26 1.51 -0.16 1.47 -0.16 1.47 -0.26 
1.52 -0.26 1.51 -0.16 1.47 -0.26 1.56 -0.16 1.51 -0.16 1.52 -0.26 1.56 -0.26 1.56 -0.16 1.52 -0.26 1.6 -0.16 1.56 -0.16 1.56 -0.26 
1.6 -0.26 1.6 -0.16 1.56 -0.26 1.64 -0.16 1.6 -0.16 1.6 -0.26 1.64 -0.26 1.64 -0.16 1.6 -0.26 1.68 -0.16 1.64 -0.16 1.64 -0.26 
1.68 -0.26 1.68 -0.16 1.64 -0.26 1.72 -0.16 1.68 -0.16 1.68 -0.26 1.73 -0.26 1.72 -0.16 1.68 -0.26 1.77 -0.16 1.72 -0.16 1.73 -0.26 
1.77 -0.26 1.77 -0.16 1.73 -0.26 1.81 -0.16 1.77 -0.16 1.77 -0.26 1.81 -0.26 1.81 -0.16 1.77 -0.26 1.85 -0.16 1.81 -0.16 1.81 -0.26 
1.85 -0.26 1.85 -0.16 1.81 -0.26 1.89 -0.16 1.85 -0.16 1.85 -0.26 1.91 -0.16 1.89 -0.16 1.85 -0.26 1.89 -0.26 1.91 -0.16 1.85 -0.26 
1.91 -0.26 1.91 -0.16 1.89 -0.26 0.04 -0.36 0 -0.19 0 -0.36 0.05 -0.19 0 -0.19 0.04 -0.36 0.08 -0.36 0.04 -0.19 0.04 -0.36 
0.08 -0.19 0.04 -0.19 0.08 -0.36 0.12 -0.36 0.08 -0.19 0.08 -0.36 0.12 -0.19 0.08 -0.19 0.12 -0.36 0.16 -0.36 0.12 -0.19 0.12 -0.36 
0.16 -0.19 0.12 -0.19 0.16 -0.36 0.2 -0.36 0.16 -0.19 0.16 -0.36 0.2 -0.19 0.16 -0.19 0.2 -0.36 0.24 -0.36 0.2 -0.19 0.2 -0.36 
0.24 -0.19 0.2 -0.19 0.24 -0.36 0.28 -0.36 0.24 -0.19 0.24 -0.36 0.28 -0.19 0.24 -0.19 0.28 -0.36 0.32 -0.36 0.28 -0.19 0.28 -0.36 
0.32 -0.19 0.28 -0.19 0.32 -0.36 0.36 -0.36 0.32 -0.19 0.32 -0.36 0.36 -0.19 0.32 -0.19 0.36 -0.36 0.4 -0.36 0.36 -0.19 0.36 -0.36 
0.4 -0.19 0.36 -0.19 0.4 -0.36 0.44 -0.36 0.4 -0.19 0.4 -0.36 0.44 -0.19 0.4 -0.19 0.44 -0.36 0.48 -0.36 0.44 -0.19 0.44 -0.36 
0.48 -0.19 0.44 -0.19 0.48 -0.36 0.52 -0.36 0.47 -0.19 0.48 -0.36 0.52 -0.19 0.47 -0.19 0.52 -0.36 0.55 -0.36 0.51 -0.19 0.52 -0.36 
0.56 -0.19 0.51 -0.19 0.55 -0.36 0.59 -0.36 0.55 -0.19 0.55 -0.36 0.6 -0.19 0.55 -0.19 0.59 -0.36 0.63 -0.36 0.59 -0.19 0.59 -0.36 
0.63 -0.19 0.59 -0.19 0.63 -0.36 0.67 -0.36 0.63 -0.19 0.63 -0.36 0.67 -0.19 0.63 -0.19 0.67 -0.36 0.71 -0.36 0.67 -0.19 0.67 -0.36 
0.71 -0.19 0.67 -0.19 0.71 -0.36 0.75 -0.36 0.71 -0.19 0.71 -0.36 0.75 -0.19 0.71 -0.19 0.75 -0.36 0.79 -0.36 0.75 -0.19 0.75 -0.36 
0.79 -0.19 0.75 -0.19 0.79 -0.36 0.83 -0.36 0.79 -0.19 0.79 -0.36 0.83 -0.19 0.79 -0.19 0.83 -0.36 0.87 -0.36 0.83 -0.19 0.83 -0.36 
0.87 -0.19 0.83 -0.19 0.87 -0.36 0.91 -0.36 0.87 -0.19 0.87 -0.36 0.91 -0.19 0.87 -0.19 0.91 -0.36 0.95 -0.36 0.91 -0.19 0.91 -0.36 
0.95 -0.19 0.91 -0.19 0.95 -0.36 0.99 -0.36 0.95 -0.19 0.95 -0.36 0.99 -0.19 0.95 -0.19 0.99 -0.36 1.03 -0.36 0.99 -0.19 0.99 -0.36 
1.03 -0.19 0.99 -0.19 1.03 -0.36 1.07 -0.36 1.02 -0.19 1.03 -0.36 1.07 -0.19 1.02 -0.19 1.07 -0.36 1.1 -0.36 1.06 -0.19 1.07 -0.36 
1.11 -0.19 1.06 -0.19 1.1 -0.36 1.14 -0.36 1.1 -0.19 1.1 -0.36 1.15 -0.19 1.1 -0.19 1.14 -0.36 1.18 -0.36 1.14 -0.19 1.14 -0.36 
1.18 -0.19 1.14 -0.19 1.18 -0.36 1.22 -0.36 1.18 -0.19 1.18 -0.36 1.22 -0.19 1.18 -0.19 1.22 -0.36 1.26 -0.36 1.22 -0.19 1.22 -0.36 
1.26 -0.19 1.22 -0.19 1.26 -0.36 1.3 -0.36 1.26 -0.19 1.26 -0.36 1.3 -0.19 1.26 -0.19 1.3 -0.36 1.34 -0.36 1.3 -0.19 1.3 -0.36 
1.34 -0.19 1.3 -0.19 1.34 -0.36 1.38 -0.36 1.34 -0.19 1.34 -0.36 1.38 -0.19 1.34 -0.19 1.38 -0.36 1.42 -0.36 1.38 -0.19 1.38 -0.36 
1.42 -0.19 1.38 -0.19 1.42 -0.36 1.46 -0.36 1.42 -0.19 1.42 -0.36 1.46 -0.19 1.42 -0.19 1.46 -0.36 1.5 -0.36 1.46 -0.19 1.46 -0.36 
1.5 -0.19 1.46 -0.19 1.5 -0.36 1.54 -0.36 1.5 -0.19 1.5 -0.36 1.54 -0.19 1.5 -0.19 1.54 -0.36 1.58 -0.36 1.54 -0.19 1.54 -0.36 
1.58 -0.19 1.54 -0.19 1.58 -0.36 1.62 -0.36 1.57 -0.19 1.58 -0.36 1.62 -0.19 1.57 -0.19 1.62 -0.36 1.65 -0.36 1.61 -0.19 1.62 -0.36 
1.66 -0.19 1.61 -0.19 1.65 -0.36 1.69 -0.36 1.65 -0.19 1.65 -0.36 1.7 -0.19 1.65 -0.19 1.69 -0.36 1.73 -0.36 1.69 -0.19 1.69 -0.36 
1.73 -0.19 1.69 -0.19 1.73 -0.36 1.77 -0.36 1.73 -0.19 1.73 -0.36 1.79 -0.36 1.73 -0.19 1.77 -0.36 1.77 -0.19 1.73 -0.19 1.79 -0.36 
1.79 -0.19 1.77 -0.19 1.79 -0.36 0.01 -0.53 0 -0.43 0 -0.53 0.04 -0.43 0 -0.43 0.01 -0.53 0.05 -0.53 0.04 -0.43 0.01 -0.53 
0.08 -0.43 0.04 -0.43 0.05 -0.53 0.09 -0.53 0.08 -0.43 0.05 -0.53 0.12 -0.43 0.08 -0.43 0.09 -0.53 0.13 -0.53 0.12 -0.43 0.09 -0.53 
0.16 -0.43 0.12 -0.43 0.13 -0.53 0.16 -0.53 0.16 -0.43 0.13 -0.53 0.2 -0.43 0.16 -0.43 0.16 -0.53 0.2 -0.53 0.2 -0.43 0.16 -0.53 
0.24 -0.43 0.2 -0.43 0.2 -0.53 0.24 -0.53 0.24 -0.43 0.2 -0.53 0.28 -0.43 0.24 -0.43 0.24 -0.53 0.28 -0.53 0.28 -0.43 0.24 -0.53 
0.32 -0.43 0.28 -0.43 0.28 -0.53 0.32 -0.53 0.32 -0.43 0.28 -0.53 0.36 -0.43 0.32 -0.43 0.32 -0.53 0.36 -0.53 0.36 -0.43 0.32 -0.53 
0.4 -0.43 0.36 -0.43 0.36 -0.53 0.4 -0.53 0.4 -0.43 0.36 -0.53 0.44 -0.43 0.4 -0.43 0.4 -0.53 0.44 -0.53 0.44 -0.43 0.4 -0.53 
0.48 -0.43 0.44 -0.43 0.44 -0.53 0.48 -0.53 0.48 -0.43 0.44 -0.53 0.52 -0.43 0.48 -0.43 0.48 -0.53 0.52 -0.53 0.52 -0.43 0.48 -0.53 
0.55 -0.43 0.52 -0.43 0.52 -0.53 0.56 -0.53 0.55 -0.43 0.52 -0.53 0.59 -0.43 0.55 -0.43 0.56 -0.53 0.6 -0.53 0.59 -0.43 0.56 -0.53 
0.63 -0.43 0.59 -0.43 0.6 -0.53 0.64 -0.53 0.63 -0.43 0.6 -0.53 0.67 -0.43 0.63 -0.43 0.64 -0.53 0.68 -0.53 0.67 -0.43 0.64 -0.53 
0.71 -0.43 0.67 -0.43 0.68 -0.53 0.71 -0.53 0.71 -0.43 0.68 -0.53 0.75 -0.43 0.71 -0.43 0.71 -0.53 0.75 -0.53 0.75 -0.43 0.71 -0.53 
0.79 -0.43 0.75 -0.43 0.75 -0.53 0.79 -0.53 0.79 -0.43 0.75 -0.53 0.83 -0.43 0.79 -0.43 0.79 -0.53 0.83 -0.53 0.83 -0.43 0.79 -0.53 
0.87 -0.43 0.83 -0.43 0.83 -0.53 0.87 -0.53 0.87 -0.43 0.83 -0.53 0.91 -0.43 0.87 -0.43 0.87 -0.53 0.91 -0.53 0.91 -0.43 0.87 -0.53 
0.95 -0.43 0.91 -0.43 0.91 -0.53 0.95 -0.53 0.95 -0.43 0.91 -0.53 0.99 -0.43 0.95 -0.43 0.95 -0.53 0.99 -0.53 0.99 -0.43 0.95 -0.53 
1.03 -0.43 0.99 -0.43 0.99 -0.53 1.03 -0.53 1.03 -0.43 0.99 -0.53 1.07 -0.43 1.03 -0.43 1.03 -0.53 1.07 -0.53 1.07 -0.43 1.03 -0.53 
1.1 -0.43 1.07 -0.43 1.07 -0.53 1.11 -0.53 1.1 -0.43 1.07 -0.53 1.14 -0.43 1.1 -0.43 1.11 -0.53 1.15 -0.53 1.14 -0.43 1.11 -0.53 
1.18 -0.43 1.14 -0.43 1.15 -0.53 1.19 -0.53 1.18 -0.43 1.15 -0.53 1.22 -0.43 1.18 -0.43 1.19 -0.53 1.23 -0.53 1.22 -0.43 1.19 -0.53 
1.26 -0.43 1.22 -0.43 1.23 -0.53 1.26 -0.53 1.26 -0.43 1.23 -0.53 1.3 -0.43 1.26 -0.43 1.26 -0.53 1.3 -0.53 1.3 -0.43 1.26 -0.53 
1.34 -0.43 1.3 -0.43 1.3 -0.53 1.34 -0.53 1.34 -0.43 1.3 -0.53 1.38 -0.43 1.34 -0.43 1.34 -0.53 1.38 -0.53 1.38 -0.43 1.34 -0.53 
1.42 -0.43 1.38 -0.43 1.38 -0.53 1.42 -0.53 1.42 -0.43 1.38 -0.53 1.46 -0.43 1.42 -0.43 1.42 -0.53 1.46 -0.53 1.46 -0.43 1.42 -0.53 
1.5 -0.43 1.46 -0.43 1.46 -0.53 1.5 -0.53 1.5 -0.43 1.46 -0.53 1.54 -0.43 1.5 -0.43 1.5 -0.53 1.54 -0.53 1.54 -0.43 1.5 -0.53 
1.58 -0.43 1.54 -0.43 1.54 -0.53 1.58 -0.53 1.58 -0.43 1.54 -0.53 1.62 -0.43 1.58 -0.43 1.58 -0.53 1.62 -0.53 1.62 -0.43 1.58 -0.53 
1.65 -0.43 1.62 -0.43 1.62 -0.53 1.66 -0.53 1.65 -0.43 1.62 -0.53 1.69 -0.43 1.65 -0.43 1.66 -0.53 1.7 -0.53 1.69 -0.43 1.66 -0.53 
1.73 -0.43 1.69 -0.43 1.7 -0.53 1.74 -0.53 1.73 -0.43 1.7 -0.53 1.77 -0.43 1.73 -0.43 1.74 -0.53 1.79 -0.43 1.77 -0.43 1.74 -0.53 
1.77 -0.53 1.79 -0.43 1.74 -0.53 1.79 -0.53 1.79 -0.43 1.77 -0.53 0.12 0 0 0 0 -0.09 0.12 -0.09 0.07 0 0 0 0 -0.16 0.07 -0.16
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="handrailTex"></texture>
                    <material is="x3d" use="handrailMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 3 0 2 -1 4 3 2 -1 5 3 4 -1 
6 5 4 -1 7 5 6 -1 8 7 6 -1 9 7 8 -1 
10 9 8 -1 11 9 10 -1 12 11 10 -1 13 11 12 -1 
14 13 12 -1 15 13 14 -1 16 15 14 -1 17 15 16 -1 
18 17 16 -1 19 17 18 -1 20 19 18 -1 21 19 20 -1 
22 21 20 -1 23 21 22 -1 24 23 22 -1 25 23 24 -1 
26 25 24 -1 27 25 26 -1 28 27 26 -1 29 27 28 -1 
30 29 28 -1 31 29 30 -1 32 31 30 -1 33 31 32 -1 
34 33 32 -1 35 33 34 -1 36 35 34 -1 37 35 36 -1 
38 37 36 -1 39 37 38 -1 40 39 38 -1 41 39 40 -1 
42 41 40 -1 43 41 42 -1 44 43 42 -1 45 43 44 -1 
46 45 44 -1 47 45 46 -1 48 47 46 -1 49 47 48 -1 
50 49 48 -1 51 49 50 -1 52 51 50 -1 53 51 52 -1 
54 53 52 -1 55 53 54 -1 56 55 54 -1 57 55 56 -1 
58 57 56 -1 59 57 58 -1 60 59 58 -1 61 59 60 -1 
62 61 60 -1 63 61 62 -1 64 63 62 -1 65 63 64 -1 
66 65 64 -1 67 65 66 -1 68 67 66 -1 69 67 68 -1 
70 69 68 -1 71 69 70 -1 72 71 70 -1 73 71 72 -1 
74 73 72 -1 75 73 74 -1 76 75 74 -1 77 75 76 -1 
78 77 76 -1 79 77 78 -1 80 79 78 -1 81 79 80 -1 
82 81 80 -1 83 81 82 -1 84 83 82 -1 85 83 84 -1 
86 85 84 -1 87 85 86 -1 88 87 86 -1 89 87 88 -1 
90 89 88 -1 91 89 90 -1 92 91 90 -1 93 92 90 -1 
94 92 93 -1 4 2 95 -1 96 4 95 -1 6 4 96 -1 
97 6 96 -1 8 6 97 -1 98 8 97 -1 10 8 98 -1 
99 10 98 -1 12 10 99 -1 100 12 99 -1 14 12 100 -1 
101 14 100 -1 16 14 101 -1 102 16 101 -1 18 16 102 -1 
103 18 102 -1 20 18 103 -1 104 20 103 -1 22 20 104 -1 
105 22 104 -1 24 22 105 -1 106 24 105 -1 26 24 106 -1 
107 26 106 -1 28 26 107 -1 108 28 107 -1 30 28 108 -1 
109 30 108 -1 32 30 109 -1 110 32 109 -1 34 32 110 -1 
111 34 110 -1 36 34 111 -1 112 36 111 -1 38 36 112 -1 
113 38 112 -1 40 38 113 -1 114 40 113 -1 42 40 114 -1 
115 42 114 -1 44 42 115 -1 116 44 115 -1 46 44 116 -1 
117 46 116 -1 48 46 117 -1 118 48 117 -1 50 48 118 -1 
119 50 118 -1 52 50 119 -1 120 52 119 -1 54 52 120 -1 
121 54 120 -1 56 54 121 -1 122 56 121 -1 58 56 122 -1 
123 58 122 -1 60 58 123 -1 124 60 123 -1 62 60 124 -1 
125 62 124 -1 64 62 125 -1 126 64 125 -1 66 64 126 -1 
127 66 126 -1 68 66 127 -1 128 68 127 -1 70 68 128 -1 
129 70 128 -1 72 70 129 -1 130 72 129 -1 74 72 130 -1 
131 74 130 -1 76 74 131 -1 132 76 131 -1 78 76 132 -1 
133 78 132 -1 80 78 133 -1 134 80 133 -1 82 80 134 -1 
135 82 134 -1 84 82 135 -1 136 84 135 -1 86 84 136 -1 
137 86 136 -1 88 86 137 -1 138 88 137 -1 90 88 138 -1 
139 90 138 -1 93 90 139 -1 140 93 139 -1 94 93 140 -1 
141 94 140 -1 142 95 143 -1 96 95 142 -1 144 96 142 -1 
97 96 144 -1 145 97 144 -1 98 97 145 -1 146 98 145 -1 
99 98 146 -1 147 99 146 -1 100 99 147 -1 148 100 147 -1 
101 100 148 -1 149 101 148 -1 102 101 149 -1 150 102 149 -1 
103 102 150 -1 151 103 150 -1 104 103 151 -1 152 104 151 -1 
105 104 152 -1 153 105 152 -1 106 105 153 -1 154 106 153 -1 
107 106 154 -1 155 107 154 -1 108 107 155 -1 156 108 155 -1 
109 108 156 -1 157 109 156 -1 110 109 157 -1 158 110 157 -1 
111 110 158 -1 159 111 158 -1 112 111 159 -1 160 112 159 -1 
113 112 160 -1 161 113 160 -1 114 113 161 -1 162 114 161 -1 
115 114 162 -1 163 115 162 -1 116 115 163 -1 164 116 163 -1 
117 116 164 -1 165 117 164 -1 118 117 165 -1 166 118 165 -1 
119 118 166 -1 167 119 166 -1 120 119 167 -1 168 120 167 -1 
121 120 168 -1 169 121 168 -1 122 121 169 -1 170 122 169 -1 
123 122 170 -1 171 123 170 -1 124 123 171 -1 172 124 171 -1 
125 124 172 -1 173 125 172 -1 126 125 173 -1 174 126 173 -1 
127 126 174 -1 175 127 174 -1 128 127 175 -1 176 128 175 -1 
129 128 176 -1 177 129 176 -1 130 129 177 -1 178 130 177 -1 
131 130 178 -1 179 131 178 -1 132 131 179 -1 180 132 179 -1 
133 132 180 -1 181 133 180 -1 134 133 181 -1 182 134 181 -1 
135 134 182 -1 183 135 182 -1 136 135 183 -1 184 136 183 -1 
137 136 184 -1 185 137 184 -1 138 137 185 -1 186 138 185 -1 
139 138 186 -1 187 139 186 -1 188 139 187 -1 140 139 188 -1 
141 140 188 -1 0 143 1 -1 142 143 0 -1 3 142 0 -1 
144 142 3 -1 5 144 3 -1 145 144 5 -1 7 145 5 -1 
146 145 7 -1 9 146 7 -1 147 146 9 -1 11 147 9 -1 
148 147 11 -1 13 148 11 -1 149 148 13 -1 15 149 13 -1 
150 149 15 -1 17 150 15 -1 151 150 17 -1 19 151 17 -1 
152 151 19 -1 21 152 19 -1 153 152 21 -1 23 153 21 -1 
154 153 23 -1 25 154 23 -1 155 154 25 -1 27 155 25 -1 
156 155 27 -1 29 156 27 -1 157 156 29 -1 31 157 29 -1 
158 157 31 -1 33 158 31 -1 159 158 33 -1 35 159 33 -1 
160 159 35 -1 37 160 35 -1 161 160 37 -1 39 161 37 -1 
162 161 39 -1 41 162 39 -1 163 162 41 -1 43 163 41 -1 
164 163 43 -1 45 164 43 -1 165 164 45 -1 47 165 45 -1 
166 165 47 -1 49 166 47 -1 167 166 49 -1 51 167 49 -1 
168 167 51 -1 53 168 51 -1 169 168 53 -1 55 169 53 -1 
170 169 55 -1 57 170 55 -1 171 170 57 -1 59 171 57 -1 
172 171 59 -1 61 172 59 -1 173 172 61 -1 63 173 61 -1 
174 173 63 -1 65 174 63 -1 175 174 65 -1 67 175 65 -1 
176 175 67 -1 69 176 67 -1 177 176 69 -1 71 177 69 -1 
178 177 71 -1 73 178 71 -1 179 178 73 -1 75 179 73 -1 
180 179 75 -1 77 180 75 -1 181 180 77 -1 79 181 77 -1 
182 181 79 -1 81 182 79 -1 183 182 81 -1 83 183 81 -1 
184 183 83 -1 85 184 83 -1 185 184 85 -1 87 185 85 -1 
186 185 87 -1 89 186 87 -1 187 186 89 -1 91 187 89 -1 
92 187 91 -1 188 187 92 -1 143 95 2 1 -1 94 141 188 92 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 -1 6 7 8 -1 9 10 11 -1 
12 13 14 -1 15 16 17 -1 18 19 20 -1 21 22 23 -1 
24 25 26 -1 27 28 29 -1 30 31 32 -1 33 34 35 -1 
36 37 38 -1 39 40 41 -1 42 43 44 -1 45 46 47 -1 
48 49 50 -1 51 52 53 -1 54 55 56 -1 57 58 59 -1 
60 61 62 -1 63 64 65 -1 66 67 68 -1 69 70 71 -1 
72 73 74 -1 75 76 77 -1 78 79 80 -1 81 82 83 -1 
84 85 86 -1 87 88 89 -1 90 91 92 -1 93 94 95 -1 
96 97 98 -1 99 100 101 -1 102 103 104 -1 105 106 107 -1 
108 109 110 -1 111 112 113 -1 114 115 116 -1 117 118 119 -1 
120 121 122 -1 123 124 125 -1 126 127 128 -1 129 130 131 -1 
132 133 134 -1 135 136 137 -1 138 139 140 -1 141 142 143 -1 
144 145 146 -1 147 148 149 -1 150 151 152 -1 153 154 155 -1 
156 157 158 -1 159 160 161 -1 162 163 164 -1 165 166 167 -1 
168 169 170 -1 171 172 173 -1 174 175 176 -1 177 178 179 -1 
180 181 182 -1 183 184 185 -1 186 187 188 -1 189 190 191 -1 
192 193 194 -1 195 196 197 -1 198 199 200 -1 201 202 203 -1 
204 205 206 -1 207 208 209 -1 210 211 212 -1 213 214 215 -1 
216 217 218 -1 219 220 221 -1 222 223 224 -1 225 226 227 -1 
228 229 230 -1 231 232 233 -1 234 235 236 -1 237 238 239 -1 
240 241 242 -1 243 244 245 -1 246 247 248 -1 249 250 251 -1 
252 253 254 -1 255 256 257 -1 258 259 260 -1 261 262 263 -1 
264 265 266 -1 267 268 269 -1 270 271 272 -1 273 274 275 -1 
276 277 278 -1 279 280 281 -1 282 283 284 -1 285 286 287 -1 
288 289 290 -1 291 292 293 -1 294 295 296 -1 297 298 299 -1 
300 301 302 -1 303 304 305 -1 306 307 308 -1 309 310 311 -1 
312 313 314 -1 315 316 317 -1 318 319 320 -1 321 322 323 -1 
324 325 326 -1 327 328 329 -1 330 331 332 -1 333 334 335 -1 
336 337 338 -1 339 340 341 -1 342 343 344 -1 345 346 347 -1 
348 349 350 -1 351 352 353 -1 354 355 356 -1 357 358 359 -1 
360 361 362 -1 363 364 365 -1 366 367 368 -1 369 370 371 -1 
372 373 374 -1 375 376 377 -1 378 379 380 -1 381 382 383 -1 
384 385 386 -1 387 388 389 -1 390 391 392 -1 393 394 395 -1 
396 397 398 -1 399 400 401 -1 402 403 404 -1 405 406 407 -1 
408 409 410 -1 411 412 413 -1 414 415 416 -1 417 418 419 -1 
420 421 422 -1 423 424 425 -1 426 427 428 -1 429 430 431 -1 
432 433 434 -1 435 436 437 -1 438 439 440 -1 441 442 443 -1 
444 445 446 -1 447 448 449 -1 450 451 452 -1 453 454 455 -1 
456 457 458 -1 459 460 461 -1 462 463 464 -1 465 466 467 -1 
468 469 470 -1 471 472 473 -1 474 475 476 -1 477 478 479 -1 
480 481 482 -1 483 484 485 -1 486 487 488 -1 489 490 491 -1 
492 493 494 -1 495 496 497 -1 498 499 500 -1 501 502 503 -1 
504 505 506 -1 507 508 509 -1 510 511 512 -1 513 514 515 -1 
516 517 518 -1 519 520 521 -1 522 523 524 -1 525 526 527 -1 
528 529 530 -1 531 532 533 -1 534 535 536 -1 537 538 539 -1 
540 541 542 -1 543 544 545 -1 546 547 548 -1 549 550 551 -1 
552 553 554 -1 555 556 557 -1 558 559 560 -1 561 562 563 -1 
564 565 566 -1 567 568 569 -1 570 571 572 -1 573 574 575 -1 
576 577 578 -1 579 580 581 -1 582 583 584 -1 585 586 587 -1 
588 589 590 -1 591 592 593 -1 594 595 596 -1 597 598 599 -1 
600 601 602 -1 603 604 605 -1 606 607 608 -1 609 610 611 -1 
612 613 614 -1 615 616 617 -1 618 619 620 -1 621 622 623 -1 
624 625 626 -1 627 628 629 -1 630 631 632 -1 633 634 635 -1 
636 637 638 -1 639 640 641 -1 642 643 644 -1 645 646 647 -1 
648 649 650 -1 651 652 653 -1 654 655 656 -1 657 658 659 -1 
660 661 662 -1 663 664 665 -1 666 667 668 -1 669 670 671 -1 
672 673 674 -1 675 676 677 -1 678 679 680 -1 681 682 683 -1 
684 685 686 -1 687 688 689 -1 690 691 692 -1 693 694 695 -1 
696 697 698 -1 699 700 701 -1 702 703 704 -1 705 706 707 -1 
708 709 710 -1 711 712 713 -1 714 715 716 -1 717 718 719 -1 
720 721 722 -1 723 724 725 -1 726 727 728 -1 729 730 731 -1 
732 733 734 -1 735 736 737 -1 738 739 740 -1 741 742 743 -1 
744 745 746 -1 747 748 749 -1 750 751 752 -1 753 754 755 -1 
756 757 758 -1 759 760 761 -1 762 763 764 -1 765 766 767 -1 
768 769 770 -1 771 772 773 -1 774 775 776 -1 777 778 779 -1 
780 781 782 -1 783 784 785 -1 786 787 788 -1 789 790 791 -1 
792 793 794 -1 795 796 797 -1 798 799 800 -1 801 802 803 -1 
804 805 806 -1 807 808 809 -1 810 811 812 -1 813 814 815 -1 
816 817 818 -1 819 820 821 -1 822 823 824 -1 825 826 827 -1 
828 829 830 -1 831 832 833 -1 834 835 836 -1 837 838 839 -1 
840 841 842 -1 843 844 845 -1 846 847 848 -1 849 850 851 -1 
852 853 854 -1 855 856 857 -1 858 859 860 -1 861 862 863 -1 
864 865 866 -1 867 868 869 -1 870 871 872 -1 873 874 875 -1 
876 877 878 -1 879 880 881 -1 882 883 884 -1 885 886 887 -1 
888 889 890 -1 891 892 893 -1 894 895 896 -1 897 898 899 -1 
900 901 902 -1 903 904 905 -1 906 907 908 -1 909 910 911 -1 
912 913 914 -1 915 916 917 -1 918 919 920 -1 921 922 923 -1 
924 925 926 -1 927 928 929 -1 930 931 932 -1 933 934 935 -1 
936 937 938 -1 939 940 941 -1 942 943 944 -1 945 946 947 -1 
948 949 950 -1 951 952 953 -1 954 955 956 -1 957 958 959 -1 
960 961 962 -1 963 964 965 -1 966 967 968 -1 969 970 971 -1 
972 973 974 -1 975 976 977 -1 978 979 980 -1 981 982 983 -1 
984 985 986 -1 987 988 989 -1 990 991 992 -1 993 994 995 -1 
996 997 998 -1 999 1000 1001 -1 1002 1003 1004 -1 1005 1006 1007 -1 
1008 1009 1010 -1 1011 1012 1013 -1 1014 1015 1016 -1 1017 1018 1019 -1 
1020 1021 1022 -1 1023 1024 1025 -1 1026 1027 1028 -1 1029 1030 1031 -1 
1032 1033 1034 -1 1035 1036 1037 -1 1038 1039 1040 -1 1041 1042 1043 -1 
1044 1045 1046 -1 1047 1048 1049 -1 1050 1051 1052 -1 1053 1054 1055 -1 
1056 1057 1058 -1 1059 1060 1061 -1 1062 1063 1064 -1 1065 1066 1067 -1 
1068 1069 1070 -1 1071 1072 1073 -1 1074 1075 1076 -1 1077 1078 1079 -1 
1080 1081 1082 -1 1083 1084 1085 -1 1086 1087 1088 -1 1089 1090 1091 -1 
1092 1093 1094 -1 1095 1096 1097 -1 1098 1099 1100 -1 1101 1102 1103 -1 
1104 1105 1106 -1 1107 1108 1109 -1 1110 1111 1112 1113 -1 1114 1115 1116 1117 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 41.12 79.97 59.93 41.22 80.05 59.86 44.83 79.98 65.46 39.43 78.75 61.02
 42.98 78.75 66.67 37.71 77.52 62.07 41.1 77.52 67.81 35.96 76.3 63.07
 39.19 76.3 68.91 34.19 75.07 64.02 37.25 75.07 69.95 32.39 73.85 64.92
 35.28 73.85 70.93 30.56 72.62 65.77 33.28 72.62 71.86 28.71 71.39 66.57
 31.26 71.39 72.73 26.84 70.17 67.31 29.21 70.17 73.54 24.95 68.94 68
 27.15 68.94 74.29 23.04 67.72 68.63 25.06 67.72 74.99 21.11 66.49 69.21
 22.95 66.49 75.62 19.17 65.27 69.74 20.82 65.27 76.2 17.21 64.04 70.21
 18.68 64.04 76.72 15.25 62.81 70.63 16.53 62.81 77.17 13.26 61.59 70.99
 14.36 61.59 77.56 11.27 60.36 71.29 12.18 60.36 77.89 9.28 59.14 71.54
 10 59.14 78.16 7.27 57.91 71.73 7.81 57.91 78.37 5.26 56.69 71.86
 5.61 56.69 78.52 3.25 55.46 71.93 3.41 55.46 78.6 1.24 54.23 71.95
 1.21 54.23 78.62 -0.77 53.01 71.91 -0.99 53.01 78.58 -2.78 51.78 71.82
 -3.19 51.78 78.47 -4.79 50.56 71.67 -5.39 50.56 78.31 -6.79 49.33 71.46
 -7.58 49.33 78.08 -8.79 48.11 71.19 -9.76 48.11 77.79 -10.77 46.88 70.87
 -11.94 46.88 77.43 -12.75 45.65 70.49 -14.1 45.65 77.02 -14.72 44.43 70.05
 -16.25 44.43 76.54 -16.67 43.2 69.56 -18.38 43.2 76.01 -18.61 41.98 69.02
 -20.5 41.98 75.41 -20.53 40.75 68.42 -22.6 40.75 74.75 -22.43 39.53 67.76
 -24.69 39.53 74.04 -24.31 38.3 67.05 -26.75 38.3 73.26 -26.18 37.07 66.29
 -28.79 37.07 72.43 -28.02 35.85 65.48 -30.8 35.85 71.54 -29.84 34.62 64.61
 -32.79 34.62 70.59 -31.63 33.4 63.7 -34.75 33.4 69.59 -33.39 32.17 62.73
 -36.68 32.17 68.53 -35.13 30.95 61.71 -38.58 30.95 67.42 -36.84 29.72 60.65
 -40.45 29.72 66.25 -38.51 28.49 59.53 -42.28 28.49 65.03 -40.16 27.27 58.37
 -44.08 27.27 63.76 -41.77 26.04 57.16 -45.84 26.04 62.44 -43.34 24.82 55.91
 -44.18 24.15 55.21 -47.57 24.82 61.07 -48.59 24.07 60.22 43.13 83.31 66.57
 41.26 82.08 67.72 39.35 80.86 68.82 37.41 79.63 69.86 35.44 78.41 70.85
 33.44 77.18 71.78 31.42 75.95 72.66 29.38 74.73 73.48 27.31 73.5 74.24
 25.22 72.28 74.94 23.12 71.05 75.58 20.99 69.83 76.16 18.85 68.6 76.68
 16.7 67.37 77.14 14.54 66.15 77.53 12.36 64.92 77.87 10.17 63.7 78.14
 7.98 62.47 78.36 5.79 61.25 78.51 3.59 60.02 78.59 1.38 58.79 78.62
 -0.82 57.57 78.58 -3.02 56.34 78.48 -5.21 55.12 78.32 -7.4 53.89 78.1
 -9.59 52.67 77.81 -11.76 51.44 77.46 -13.92 50.21 77.05 -16.08 48.99 76.58
 -18.21 47.76 76.05 -20.33 46.54 75.46 -22.44 45.31 74.81 -24.52 44.09 74.1
 -26.58 42.86 73.33 -28.62 41.63 72.5 -30.64 40.41 71.61 -32.63 39.18 70.67
 -34.59 37.96 69.67 -36.53 36.73 68.62 -38.43 35.5 67.51 -40.3 34.28 66.35
 -42.14 33.05 65.13 -43.94 31.83 63.87 -45.7 30.6 62.55 -47.43 29.38 61.18
 -49.12 28.15 59.77 -50.12 27.41 58.89 37.85 82.08 61.99 39.56 83.31 60.94
 36.1 80.86 63 34.33 79.63 63.95 32.53 78.41 64.85 30.71 77.18 65.7
 28.86 75.95 66.5 26.99 74.73 67.25 25.1 73.5 67.94 23.2 72.28 68.58
 21.27 71.05 69.17 19.33 69.83 69.7 17.37 68.6 70.18 15.4 67.37 70.6
 13.42 66.15 70.96 11.43 64.92 71.27 9.44 63.7 71.52 7.43 62.47 71.71
 5.43 61.25 71.85 3.41 60.02 71.93 1.4 58.79 71.95 -0.61 57.57 71.92
 -2.62 56.34 71.83 -4.63 55.12 71.68 -6.63 53.89 71.47 -8.63 52.67 71.21
 -10.61 51.44 70.89 -12.59 50.21 70.52 -14.56 48.99 70.09 -16.51 47.76 69.6
 -18.45 46.54 69.06 -20.37 45.31 68.47 -22.28 44.09 67.82 -24.16 42.86 67.11
 -26.03 41.63 66.36 -27.87 40.41 65.55 -29.69 39.18 64.69 -31.48 37.96 63.77
 -33.25 36.73 62.81 -34.99 35.5 61.8 -36.7 34.28 60.73 -38.38 33.05 59.62
 -40.03 31.83 58.47 -41.64 30.6 57.26 -43.22 29.38 56.01 -44.76 28.15 54.72
 -45.68 27.41 53.91"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0.08 0 0.08 0 -0.09 0.05 0.08 0.01 0.08 0 -0.09 0.05 -0.09 0.05 0.08 0 -0.09 0.09 0.08 0.05 0.08 0.05 -0.09 
0.09 -0.09 0.09 0.08 0.05 -0.09 0.13 0.08 0.09 0.08 0.09 -0.09 0.13 -0.09 0.13 0.08 0.09 -0.09 0.17 0.08 0.13 0.08 0.13 -0.09 
0.17 -0.09 0.17 0.08 0.13 -0.09 0.21 0.08 0.17 0.08 0.17 -0.09 0.21 -0.09 0.21 0.08 0.17 -0.09 0.26 0.08 0.22 0.08 0.21 -0.09 
0.26 -0.09 0.26 0.08 0.21 -0.09 0.3 0.08 0.26 0.08 0.26 -0.09 0.3 -0.09 0.3 0.08 0.26 -0.09 0.34 0.08 0.3 0.08 0.3 -0.09 
0.34 -0.09 0.34 0.08 0.3 -0.09 0.38 0.08 0.34 0.08 0.34 -0.09 0.38 -0.09 0.38 0.08 0.34 -0.09 0.42 0.08 0.38 0.08 0.38 -0.09 
0.42 -0.09 0.42 0.08 0.38 -0.09 0.47 0.08 0.43 0.08 0.42 -0.09 0.47 -0.09 0.47 0.08 0.42 -0.09 0.51 0.08 0.47 0.08 0.47 -0.09 
0.51 -0.09 0.51 0.08 0.47 -0.09 0.55 0.08 0.51 0.08 0.51 -0.09 0.55 -0.09 0.55 0.08 0.51 -0.09 0.59 0.08 0.55 0.08 0.55 -0.09 
0.59 -0.09 0.59 0.08 0.55 -0.09 0.63 0.08 0.59 0.08 0.59 -0.09 0.63 -0.09 0.63 0.08 0.59 -0.09 0.68 0.08 0.64 0.08 0.63 -0.09 
0.68 -0.09 0.68 0.08 0.63 -0.09 0.72 0.08 0.68 0.08 0.68 -0.09 0.72 -0.09 0.72 0.08 0.68 -0.09 0.76 0.08 0.72 0.08 0.72 -0.09 
0.76 -0.09 0.76 0.08 0.72 -0.09 0.8 0.08 0.76 0.08 0.76 -0.09 0.8 -0.09 0.8 0.08 0.76 -0.09 0.84 0.08 0.8 0.08 0.8 -0.09 
0.84 -0.09 0.84 0.08 0.8 -0.09 0.89 0.08 0.85 0.08 0.84 -0.09 0.89 -0.09 0.89 0.08 0.84 -0.09 0.93 0.08 0.89 0.08 0.89 -0.09 
0.93 -0.09 0.93 0.08 0.89 -0.09 0.97 0.08 0.93 0.08 0.93 -0.09 0.97 -0.09 0.97 0.08 0.93 -0.09 1.01 0.08 0.97 0.08 0.97 -0.09 
1.01 -0.09 1.01 0.08 0.97 -0.09 1.05 0.08 1.01 0.08 1.01 -0.09 1.06 -0.09 1.05 0.08 1.01 -0.09 1.1 0.08 1.06 0.08 1.06 -0.09 
1.1 -0.09 1.1 0.08 1.06 -0.09 1.14 0.08 1.1 0.08 1.1 -0.09 1.14 -0.09 1.14 0.08 1.1 -0.09 1.18 0.08 1.14 0.08 1.14 -0.09 
1.18 -0.09 1.18 0.08 1.14 -0.09 1.22 0.08 1.18 0.08 1.18 -0.09 1.22 -0.09 1.22 0.08 1.18 -0.09 1.26 0.08 1.22 0.08 1.22 -0.09 
1.27 -0.09 1.26 0.08 1.22 -0.09 1.31 0.08 1.27 0.08 1.27 -0.09 1.31 -0.09 1.31 0.08 1.27 -0.09 1.35 0.08 1.31 0.08 1.31 -0.09 
1.35 -0.09 1.35 0.08 1.31 -0.09 1.39 0.08 1.35 0.08 1.35 -0.09 1.39 -0.09 1.39 0.08 1.35 -0.09 1.43 0.08 1.39 0.08 1.39 -0.09 
1.43 -0.09 1.43 0.08 1.39 -0.09 1.47 0.08 1.43 0.08 1.43 -0.09 1.48 -0.09 1.47 0.08 1.43 -0.09 1.52 0.08 1.48 0.08 1.48 -0.09 
1.52 -0.09 1.52 0.08 1.48 -0.09 1.56 0.08 1.52 0.08 1.52 -0.09 1.56 -0.09 1.56 0.08 1.52 -0.09 1.6 0.08 1.56 0.08 1.56 -0.09 
1.6 -0.09 1.6 0.08 1.56 -0.09 1.64 0.08 1.6 0.08 1.6 -0.09 1.64 -0.09 1.64 0.08 1.6 -0.09 1.68 0.08 1.64 0.08 1.64 -0.09 
1.69 -0.09 1.68 0.08 1.64 -0.09 1.73 0.08 1.69 0.08 1.69 -0.09 1.73 -0.09 1.73 0.08 1.69 -0.09 1.77 0.08 1.73 0.08 1.73 -0.09 
1.77 -0.09 1.77 0.08 1.73 -0.09 1.81 0.08 1.77 0.08 1.77 -0.09 1.81 -0.09 1.81 0.08 1.77 -0.09 1.85 0.08 1.81 0.08 1.81 -0.09 
1.85 -0.09 1.85 0.08 1.81 -0.09 1.89 0.08 1.85 0.08 1.85 -0.09 1.92 0.07 1.9 0.07 1.85 -0.09 1.9 -0.09 1.91 0.08 1.85 -0.09 
1.92 -0.09 1.92 0.08 1.9 -0.09 0.04 -0.16 0 -0.16 0 -0.26 0.05 -0.26 0.04 -0.16 0 -0.26 0.09 -0.16 0.04 -0.16 0.05 -0.26 
0.09 -0.26 0.09 -0.16 0.05 -0.26 0.13 -0.16 0.09 -0.16 0.09 -0.26 0.13 -0.26 0.13 -0.16 0.09 -0.26 0.17 -0.16 0.13 -0.16 0.13 -0.26 
0.17 -0.26 0.17 -0.16 0.13 -0.26 0.21 -0.16 0.17 -0.16 0.17 -0.26 0.21 -0.26 0.21 -0.16 0.17 -0.26 0.25 -0.16 0.21 -0.16 0.21 -0.26 
0.26 -0.26 0.25 -0.16 0.21 -0.26 0.3 -0.16 0.25 -0.16 0.26 -0.26 0.3 -0.26 0.3 -0.16 0.26 -0.26 0.34 -0.16 0.3 -0.16 0.3 -0.26 
0.34 -0.26 0.34 -0.16 0.3 -0.26 0.38 -0.16 0.34 -0.16 0.34 -0.26 0.38 -0.26 0.38 -0.16 0.34 -0.26 0.42 -0.16 0.38 -0.16 0.38 -0.26 
0.42 -0.26 0.42 -0.16 0.38 -0.26 0.46 -0.16 0.42 -0.16 0.42 -0.26 0.47 -0.26 0.46 -0.16 0.42 -0.26 0.51 -0.16 0.46 -0.16 0.47 -0.26 
0.51 -0.26 0.51 -0.16 0.47 -0.26 0.55 -0.16 0.51 -0.16 0.51 -0.26 0.55 -0.26 0.55 -0.16 0.51 -0.26 0.59 -0.16 0.55 -0.16 0.55 -0.26 
0.59 -0.26 0.59 -0.16 0.55 -0.26 0.63 -0.16 0.59 -0.16 0.59 -0.26 0.63 -0.26 0.63 -0.16 0.59 -0.26 0.67 -0.16 0.63 -0.16 0.63 -0.26 
0.68 -0.26 0.67 -0.16 0.63 -0.26 0.72 -0.16 0.67 -0.16 0.68 -0.26 0.72 -0.26 0.72 -0.16 0.68 -0.26 0.76 -0.16 0.72 -0.16 0.72 -0.26 
0.76 -0.26 0.76 -0.16 0.72 -0.26 0.8 -0.16 0.76 -0.16 0.76 -0.26 0.8 -0.26 0.8 -0.16 0.76 -0.26 0.84 -0.16 0.8 -0.16 0.8 -0.26 
0.84 -0.26 0.84 -0.16 0.8 -0.26 0.88 -0.16 0.84 -0.16 0.84 -0.26 0.89 -0.26 0.88 -0.16 0.84 -0.26 0.93 -0.16 0.88 -0.16 0.89 -0.26 
0.93 -0.26 0.93 -0.16 0.89 -0.26 0.97 -0.16 0.93 -0.16 0.93 -0.26 0.97 -0.26 0.97 -0.16 0.93 -0.26 1.01 -0.16 0.97 -0.16 0.97 -0.26 
1.01 -0.26 1.01 -0.16 0.97 -0.26 1.05 -0.16 1.01 -0.16 1.01 -0.26 1.05 -0.26 1.05 -0.16 1.01 -0.26 1.09 -0.16 1.05 -0.16 1.05 -0.26 
1.1 -0.26 1.09 -0.16 1.05 -0.26 1.14 -0.16 1.09 -0.16 1.1 -0.26 1.14 -0.26 1.14 -0.16 1.1 -0.26 1.18 -0.16 1.14 -0.16 1.14 -0.26 
1.18 -0.26 1.18 -0.16 1.14 -0.26 1.22 -0.16 1.18 -0.16 1.18 -0.26 1.22 -0.26 1.22 -0.16 1.18 -0.26 1.26 -0.16 1.22 -0.16 1.22 -0.26 
1.26 -0.26 1.26 -0.16 1.22 -0.26 1.3 -0.16 1.26 -0.16 1.26 -0.26 1.31 -0.26 1.3 -0.16 1.26 -0.26 1.35 -0.16 1.3 -0.16 1.31 -0.26 
1.35 -0.26 1.35 -0.16 1.31 -0.26 1.39 -0.16 1.35 -0.16 1.35 -0.26 1.39 -0.26 1.39 -0.16 1.35 -0.26 1.43 -0.16 1.39 -0.16 1.39 -0.26 
1.43 -0.26 1.43 -0.16 1.39 -0.26 1.47 -0.16 1.43 -0.16 1.43 -0.26 1.47 -0.26 1.47 -0.16 1.43 -0.26 1.51 -0.16 1.47 -0.16 1.47 -0.26 
1.52 -0.26 1.51 -0.16 1.47 -0.26 1.56 -0.16 1.51 -0.16 1.52 -0.26 1.56 -0.26 1.56 -0.16 1.52 -0.26 1.6 -0.16 1.56 -0.16 1.56 -0.26 
1.6 -0.26 1.6 -0.16 1.56 -0.26 1.64 -0.16 1.6 -0.16 1.6 -0.26 1.64 -0.26 1.64 -0.16 1.6 -0.26 1.68 -0.16 1.64 -0.16 1.64 -0.26 
1.68 -0.26 1.68 -0.16 1.64 -0.26 1.72 -0.16 1.68 -0.16 1.68 -0.26 1.73 -0.26 1.72 -0.16 1.68 -0.26 1.77 -0.16 1.72 -0.16 1.73 -0.26 
1.77 -0.26 1.77 -0.16 1.73 -0.26 1.81 -0.16 1.77 -0.16 1.77 -0.26 1.81 -0.26 1.81 -0.16 1.77 -0.26 1.85 -0.16 1.81 -0.16 1.81 -0.26 
1.85 -0.26 1.85 -0.16 1.81 -0.26 1.89 -0.16 1.85 -0.16 1.85 -0.26 1.89 -0.26 1.89 -0.16 1.85 -0.26 1.92 -0.16 1.89 -0.16 1.89 -0.26 
1.92 -0.26 1.92 -0.16 1.89 -0.26 0.04 -0.36 0 -0.19 0 -0.36 0.05 -0.19 0 -0.19 0.04 -0.36 0.08 -0.36 0.04 -0.19 0.04 -0.36 
0.08 -0.19 0.04 -0.19 0.08 -0.36 0.12 -0.36 0.08 -0.19 0.08 -0.36 0.12 -0.19 0.08 -0.19 0.12 -0.36 0.16 -0.36 0.12 -0.19 0.12 -0.36 
0.16 -0.19 0.12 -0.19 0.16 -0.36 0.2 -0.36 0.16 -0.19 0.16 -0.36 0.2 -0.19 0.16 -0.19 0.2 -0.36 0.24 -0.36 0.2 -0.19 0.2 -0.36 
0.24 -0.19 0.2 -0.19 0.24 -0.36 0.28 -0.36 0.24 -0.19 0.24 -0.36 0.28 -0.19 0.24 -0.19 0.28 -0.36 0.32 -0.36 0.28 -0.19 0.28 -0.36 
0.32 -0.19 0.28 -0.19 0.32 -0.36 0.36 -0.36 0.32 -0.19 0.32 -0.36 0.36 -0.19 0.32 -0.19 0.36 -0.36 0.4 -0.36 0.36 -0.19 0.36 -0.36 
0.4 -0.19 0.36 -0.19 0.4 -0.36 0.44 -0.36 0.4 -0.19 0.4 -0.36 0.44 -0.19 0.4 -0.19 0.44 -0.36 0.48 -0.36 0.44 -0.19 0.44 -0.36 
0.48 -0.19 0.44 -0.19 0.48 -0.36 0.52 -0.36 0.47 -0.19 0.48 -0.36 0.52 -0.19 0.47 -0.19 0.52 -0.36 0.55 -0.36 0.51 -0.19 0.52 -0.36 
0.56 -0.19 0.51 -0.19 0.55 -0.36 0.59 -0.36 0.55 -0.19 0.55 -0.36 0.6 -0.19 0.55 -0.19 0.59 -0.36 0.63 -0.36 0.59 -0.19 0.59 -0.36 
0.63 -0.19 0.59 -0.19 0.63 -0.36 0.67 -0.36 0.63 -0.19 0.63 -0.36 0.67 -0.19 0.63 -0.19 0.67 -0.36 0.71 -0.36 0.67 -0.19 0.67 -0.36 
0.71 -0.19 0.67 -0.19 0.71 -0.36 0.75 -0.36 0.71 -0.19 0.71 -0.36 0.75 -0.19 0.71 -0.19 0.75 -0.36 0.79 -0.36 0.75 -0.19 0.75 -0.36 
0.79 -0.19 0.75 -0.19 0.79 -0.36 0.83 -0.36 0.79 -0.19 0.79 -0.36 0.83 -0.19 0.79 -0.19 0.83 -0.36 0.87 -0.36 0.83 -0.19 0.83 -0.36 
0.87 -0.19 0.83 -0.19 0.87 -0.36 0.91 -0.36 0.87 -0.19 0.87 -0.36 0.91 -0.19 0.87 -0.19 0.91 -0.36 0.95 -0.36 0.91 -0.19 0.91 -0.36 
0.95 -0.19 0.91 -0.19 0.95 -0.36 0.99 -0.36 0.95 -0.19 0.95 -0.36 0.99 -0.19 0.95 -0.19 0.99 -0.36 1.03 -0.36 0.99 -0.19 0.99 -0.36 
1.03 -0.19 0.99 -0.19 1.03 -0.36 1.07 -0.36 1.02 -0.19 1.03 -0.36 1.07 -0.19 1.02 -0.19 1.07 -0.36 1.1 -0.36 1.06 -0.19 1.07 -0.36 
1.11 -0.19 1.06 -0.19 1.1 -0.36 1.14 -0.36 1.1 -0.19 1.1 -0.36 1.15 -0.19 1.1 -0.19 1.14 -0.36 1.18 -0.36 1.14 -0.19 1.14 -0.36 
1.18 -0.19 1.14 -0.19 1.18 -0.36 1.22 -0.36 1.18 -0.19 1.18 -0.36 1.22 -0.19 1.18 -0.19 1.22 -0.36 1.26 -0.36 1.22 -0.19 1.22 -0.36 
1.26 -0.19 1.22 -0.19 1.26 -0.36 1.3 -0.36 1.26 -0.19 1.26 -0.36 1.3 -0.19 1.26 -0.19 1.3 -0.36 1.34 -0.36 1.3 -0.19 1.3 -0.36 
1.34 -0.19 1.3 -0.19 1.34 -0.36 1.38 -0.36 1.34 -0.19 1.34 -0.36 1.38 -0.19 1.34 -0.19 1.38 -0.36 1.42 -0.36 1.38 -0.19 1.38 -0.36 
1.42 -0.19 1.38 -0.19 1.42 -0.36 1.46 -0.36 1.42 -0.19 1.42 -0.36 1.46 -0.19 1.42 -0.19 1.46 -0.36 1.5 -0.36 1.46 -0.19 1.46 -0.36 
1.5 -0.19 1.46 -0.19 1.5 -0.36 1.54 -0.36 1.5 -0.19 1.5 -0.36 1.54 -0.19 1.5 -0.19 1.54 -0.36 1.58 -0.36 1.54 -0.19 1.54 -0.36 
1.58 -0.19 1.54 -0.19 1.58 -0.36 1.62 -0.36 1.57 -0.19 1.58 -0.36 1.62 -0.19 1.57 -0.19 1.62 -0.36 1.65 -0.36 1.61 -0.19 1.62 -0.36 
1.66 -0.19 1.61 -0.19 1.65 -0.36 1.69 -0.36 1.65 -0.19 1.65 -0.36 1.7 -0.19 1.65 -0.19 1.69 -0.36 1.73 -0.36 1.69 -0.19 1.69 -0.36 
1.73 -0.19 1.69 -0.19 1.73 -0.36 1.77 -0.36 1.73 -0.19 1.73 -0.36 1.8 -0.36 1.73 -0.19 1.77 -0.36 1.77 -0.19 1.73 -0.19 1.8 -0.36 
1.8 -0.19 1.77 -0.19 1.8 -0.36 0.01 -0.53 0 -0.43 0 -0.53 0.04 -0.43 0 -0.43 0.01 -0.53 0.05 -0.53 0.04 -0.43 0.01 -0.53 
0.08 -0.43 0.04 -0.43 0.05 -0.53 0.09 -0.53 0.08 -0.43 0.05 -0.53 0.12 -0.43 0.08 -0.43 0.09 -0.53 0.13 -0.53 0.12 -0.43 0.09 -0.53 
0.16 -0.43 0.12 -0.43 0.13 -0.53 0.16 -0.53 0.16 -0.43 0.13 -0.53 0.2 -0.43 0.16 -0.43 0.16 -0.53 0.2 -0.53 0.2 -0.43 0.16 -0.53 
0.24 -0.43 0.2 -0.43 0.2 -0.53 0.24 -0.53 0.24 -0.43 0.2 -0.53 0.28 -0.43 0.24 -0.43 0.24 -0.53 0.28 -0.53 0.28 -0.43 0.24 -0.53 
0.32 -0.43 0.28 -0.43 0.28 -0.53 0.32 -0.53 0.32 -0.43 0.28 -0.53 0.36 -0.43 0.32 -0.43 0.32 -0.53 0.36 -0.53 0.36 -0.43 0.32 -0.53 
0.4 -0.43 0.36 -0.43 0.36 -0.53 0.4 -0.53 0.4 -0.43 0.36 -0.53 0.44 -0.43 0.4 -0.43 0.4 -0.53 0.44 -0.53 0.44 -0.43 0.4 -0.53 
0.48 -0.43 0.44 -0.43 0.44 -0.53 0.48 -0.53 0.48 -0.43 0.44 -0.53 0.52 -0.43 0.48 -0.43 0.48 -0.53 0.52 -0.53 0.52 -0.43 0.48 -0.53 
0.55 -0.43 0.52 -0.43 0.52 -0.53 0.56 -0.53 0.55 -0.43 0.52 -0.53 0.59 -0.43 0.55 -0.43 0.56 -0.53 0.6 -0.53 0.59 -0.43 0.56 -0.53 
0.63 -0.43 0.59 -0.43 0.6 -0.53 0.64 -0.53 0.63 -0.43 0.6 -0.53 0.67 -0.43 0.63 -0.43 0.64 -0.53 0.68 -0.53 0.67 -0.43 0.64 -0.53 
0.71 -0.43 0.67 -0.43 0.68 -0.53 0.71 -0.53 0.71 -0.43 0.68 -0.53 0.75 -0.43 0.71 -0.43 0.71 -0.53 0.75 -0.53 0.75 -0.43 0.71 -0.53 
0.79 -0.43 0.75 -0.43 0.75 -0.53 0.79 -0.53 0.79 -0.43 0.75 -0.53 0.83 -0.43 0.79 -0.43 0.79 -0.53 0.83 -0.53 0.83 -0.43 0.79 -0.53 
0.87 -0.43 0.83 -0.43 0.83 -0.53 0.87 -0.53 0.87 -0.43 0.83 -0.53 0.91 -0.43 0.87 -0.43 0.87 -0.53 0.91 -0.53 0.91 -0.43 0.87 -0.53 
0.95 -0.43 0.91 -0.43 0.91 -0.53 0.95 -0.53 0.95 -0.43 0.91 -0.53 0.99 -0.43 0.95 -0.43 0.95 -0.53 0.99 -0.53 0.99 -0.43 0.95 -0.53 
1.03 -0.43 0.99 -0.43 0.99 -0.53 1.03 -0.53 1.03 -0.43 0.99 -0.53 1.07 -0.43 1.03 -0.43 1.03 -0.53 1.07 -0.53 1.07 -0.43 1.03 -0.53 
1.1 -0.43 1.07 -0.43 1.07 -0.53 1.11 -0.53 1.1 -0.43 1.07 -0.53 1.14 -0.43 1.1 -0.43 1.11 -0.53 1.15 -0.53 1.14 -0.43 1.11 -0.53 
1.18 -0.43 1.14 -0.43 1.15 -0.53 1.19 -0.53 1.18 -0.43 1.15 -0.53 1.22 -0.43 1.18 -0.43 1.19 -0.53 1.23 -0.53 1.22 -0.43 1.19 -0.53 
1.26 -0.43 1.22 -0.43 1.23 -0.53 1.26 -0.53 1.26 -0.43 1.23 -0.53 1.3 -0.43 1.26 -0.43 1.26 -0.53 1.3 -0.53 1.3 -0.43 1.26 -0.53 
1.34 -0.43 1.3 -0.43 1.3 -0.53 1.34 -0.53 1.34 -0.43 1.3 -0.53 1.38 -0.43 1.34 -0.43 1.34 -0.53 1.38 -0.53 1.38 -0.43 1.34 -0.53 
1.42 -0.43 1.38 -0.43 1.38 -0.53 1.42 -0.53 1.42 -0.43 1.38 -0.53 1.46 -0.43 1.42 -0.43 1.42 -0.53 1.46 -0.53 1.46 -0.43 1.42 -0.53 
1.5 -0.43 1.46 -0.43 1.46 -0.53 1.5 -0.53 1.5 -0.43 1.46 -0.53 1.54 -0.43 1.5 -0.43 1.5 -0.53 1.54 -0.53 1.54 -0.43 1.5 -0.53 
1.58 -0.43 1.54 -0.43 1.54 -0.53 1.58 -0.53 1.58 -0.43 1.54 -0.53 1.62 -0.43 1.58 -0.43 1.58 -0.53 1.62 -0.53 1.62 -0.43 1.58 -0.53 
1.65 -0.43 1.62 -0.43 1.62 -0.53 1.66 -0.53 1.65 -0.43 1.62 -0.53 1.69 -0.43 1.65 -0.43 1.66 -0.53 1.7 -0.53 1.69 -0.43 1.66 -0.53 
1.73 -0.43 1.69 -0.43 1.7 -0.53 1.74 -0.53 1.73 -0.43 1.7 -0.53 1.77 -0.43 1.73 -0.43 1.74 -0.53 1.77 -0.53 1.77 -0.43 1.74 -0.53 
1.8 -0.53 1.77 -0.43 1.77 -0.53 1.8 -0.43 1.77 -0.43 1.8 -0.53 0.12 0 0 0 0 -0.09 0.12 -0.09 0.07 0 0 0 0 -0.16 0.07 -0.16
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="handrailTex"></texture>
                    <material is="x3d" use="handrailMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 3 0 2 -1 4 3 2 -1 5 3 4 -1 
6 5 4 -1 7 5 6 -1 8 7 6 -1 9 7 8 -1 
10 9 8 -1 11 9 10 -1 12 11 10 -1 13 11 12 -1 
14 13 12 -1 15 13 14 -1 16 15 14 -1 17 15 16 -1 
18 17 16 -1 19 17 18 -1 20 19 18 -1 21 19 20 -1 
22 21 20 -1 23 21 22 -1 24 23 22 -1 25 23 24 -1 
26 25 24 -1 27 25 26 -1 28 27 26 -1 29 27 28 -1 
30 29 28 -1 31 29 30 -1 32 31 30 -1 33 31 32 -1 
34 33 32 -1 35 33 34 -1 36 35 34 -1 37 35 36 -1 
38 37 36 -1 39 37 38 -1 40 39 38 -1 41 39 40 -1 
42 41 40 -1 43 41 42 -1 44 43 42 -1 45 43 44 -1 
46 45 44 -1 47 45 46 -1 48 47 46 -1 49 47 48 -1 
50 49 48 -1 51 49 50 -1 52 51 50 -1 53 51 52 -1 
54 53 52 -1 55 53 54 -1 56 55 54 -1 57 55 56 -1 
58 57 56 -1 59 57 58 -1 60 59 58 -1 61 59 60 -1 
62 61 60 -1 63 61 62 -1 64 63 62 -1 65 63 64 -1 
66 65 64 -1 67 65 66 -1 68 67 66 -1 69 67 68 -1 
70 69 68 -1 71 69 70 -1 72 71 70 -1 73 71 72 -1 
74 73 72 -1 75 73 74 -1 76 75 74 -1 77 75 76 -1 
78 77 76 -1 79 77 78 -1 80 79 78 -1 81 79 80 -1 
82 81 80 -1 83 81 82 -1 84 83 82 -1 85 83 84 -1 
86 85 84 -1 87 85 86 -1 88 87 86 -1 89 87 88 -1 
90 89 88 -1 91 89 90 -1 92 91 90 -1 93 91 92 -1 
94 93 92 -1 95 94 92 -1 96 94 95 -1 4 2 97 -1 
98 4 97 -1 6 4 98 -1 99 6 98 -1 8 6 99 -1 
100 8 99 -1 10 8 100 -1 101 10 100 -1 12 10 101 -1 
102 12 101 -1 14 12 102 -1 103 14 102 -1 16 14 103 -1 
104 16 103 -1 18 16 104 -1 105 18 104 -1 20 18 105 -1 
106 20 105 -1 22 20 106 -1 107 22 106 -1 24 22 107 -1 
108 24 107 -1 26 24 108 -1 109 26 108 -1 28 26 109 -1 
110 28 109 -1 30 28 110 -1 111 30 110 -1 32 30 111 -1 
112 32 111 -1 34 32 112 -1 113 34 112 -1 36 34 113 -1 
114 36 113 -1 38 36 114 -1 115 38 114 -1 40 38 115 -1 
116 40 115 -1 42 40 116 -1 117 42 116 -1 44 42 117 -1 
118 44 117 -1 46 44 118 -1 119 46 118 -1 48 46 119 -1 
120 48 119 -1 50 48 120 -1 121 50 120 -1 52 50 121 -1 
122 52 121 -1 54 52 122 -1 123 54 122 -1 56 54 123 -1 
124 56 123 -1 58 56 124 -1 125 58 124 -1 60 58 125 -1 
126 60 125 -1 62 60 126 -1 127 62 126 -1 64 62 127 -1 
128 64 127 -1 66 64 128 -1 129 66 128 -1 68 66 129 -1 
130 68 129 -1 70 68 130 -1 131 70 130 -1 72 70 131 -1 
132 72 131 -1 74 72 132 -1 133 74 132 -1 76 74 133 -1 
134 76 133 -1 78 76 134 -1 135 78 134 -1 80 78 135 -1 
136 80 135 -1 82 80 136 -1 137 82 136 -1 84 82 137 -1 
138 84 137 -1 86 84 138 -1 139 86 138 -1 88 86 139 -1 
140 88 139 -1 90 88 140 -1 141 90 140 -1 92 90 141 -1 
142 92 141 -1 95 92 142 -1 96 95 142 -1 143 96 142 -1 
144 96 143 -1 145 97 146 -1 98 97 145 -1 147 98 145 -1 
99 98 147 -1 148 99 147 -1 100 99 148 -1 149 100 148 -1 
101 100 149 -1 150 101 149 -1 102 101 150 -1 151 102 150 -1 
103 102 151 -1 152 103 151 -1 104 103 152 -1 153 104 152 -1 
105 104 153 -1 154 105 153 -1 106 105 154 -1 155 106 154 -1 
107 106 155 -1 156 107 155 -1 108 107 156 -1 157 108 156 -1 
109 108 157 -1 158 109 157 -1 110 109 158 -1 159 110 158 -1 
111 110 159 -1 160 111 159 -1 112 111 160 -1 161 112 160 -1 
113 112 161 -1 162 113 161 -1 114 113 162 -1 163 114 162 -1 
115 114 163 -1 164 115 163 -1 116 115 164 -1 165 116 164 -1 
117 116 165 -1 166 117 165 -1 118 117 166 -1 167 118 166 -1 
119 118 167 -1 168 119 167 -1 120 119 168 -1 169 120 168 -1 
121 120 169 -1 170 121 169 -1 122 121 170 -1 171 122 170 -1 
123 122 171 -1 172 123 171 -1 124 123 172 -1 173 124 172 -1 
125 124 173 -1 174 125 173 -1 126 125 174 -1 175 126 174 -1 
127 126 175 -1 176 127 175 -1 128 127 176 -1 177 128 176 -1 
129 128 177 -1 178 129 177 -1 130 129 178 -1 179 130 178 -1 
131 130 179 -1 180 131 179 -1 132 131 180 -1 181 132 180 -1 
133 132 181 -1 182 133 181 -1 134 133 182 -1 183 134 182 -1 
135 134 183 -1 184 135 183 -1 136 135 184 -1 185 136 184 -1 
137 136 185 -1 186 137 185 -1 138 137 186 -1 187 138 186 -1 
139 138 187 -1 188 139 187 -1 140 139 188 -1 189 140 188 -1 
141 140 189 -1 190 141 189 -1 142 141 190 -1 191 142 190 -1 
192 142 191 -1 143 142 192 -1 144 143 192 -1 0 146 1 -1 
145 146 0 -1 3 145 0 -1 147 145 3 -1 5 147 3 -1 
148 147 5 -1 7 148 5 -1 149 148 7 -1 9 149 7 -1 
150 149 9 -1 11 150 9 -1 151 150 11 -1 13 151 11 -1 
152 151 13 -1 15 152 13 -1 153 152 15 -1 17 153 15 -1 
154 153 17 -1 19 154 17 -1 155 154 19 -1 21 155 19 -1 
156 155 21 -1 23 156 21 -1 157 156 23 -1 25 157 23 -1 
158 157 25 -1 27 158 25 -1 159 158 27 -1 29 159 27 -1 
160 159 29 -1 31 160 29 -1 161 160 31 -1 33 161 31 -1 
162 161 33 -1 35 162 33 -1 163 162 35 -1 37 163 35 -1 
164 163 37 -1 39 164 37 -1 165 164 39 -1 41 165 39 -1 
166 165 41 -1 43 166 41 -1 167 166 43 -1 45 167 43 -1 
168 167 45 -1 47 168 45 -1 169 168 47 -1 49 169 47 -1 
170 169 49 -1 51 170 49 -1 171 170 51 -1 53 171 51 -1 
172 171 53 -1 55 172 53 -1 173 172 55 -1 57 173 55 -1 
174 173 57 -1 59 174 57 -1 175 174 59 -1 61 175 59 -1 
176 175 61 -1 63 176 61 -1 177 176 63 -1 65 177 63 -1 
178 177 65 -1 67 178 65 -1 179 178 67 -1 69 179 67 -1 
180 179 69 -1 71 180 69 -1 181 180 71 -1 73 181 71 -1 
182 181 73 -1 75 182 73 -1 183 182 75 -1 77 183 75 -1 
184 183 77 -1 79 184 77 -1 185 184 79 -1 81 185 79 -1 
186 185 81 -1 83 186 81 -1 187 186 83 -1 85 187 83 -1 
188 187 85 -1 87 188 85 -1 189 188 87 -1 89 189 87 -1 
190 189 89 -1 91 190 89 -1 191 190 91 -1 192 191 91 -1 
93 192 91 -1 94 192 93 -1 146 97 2 1 -1 96 144 192 94 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 -1 6 7 8 -1 9 10 11 -1 
12 13 14 -1 15 16 17 -1 18 19 20 -1 21 22 23 -1 
24 25 26 -1 27 28 29 -1 30 31 32 -1 33 34 35 -1 
36 37 38 -1 39 40 41 -1 42 43 44 -1 45 46 47 -1 
48 49 50 -1 51 52 53 -1 54 55 56 -1 57 58 59 -1 
60 61 62 -1 63 64 65 -1 66 67 68 -1 69 70 71 -1 
72 73 74 -1 75 76 77 -1 78 79 80 -1 81 82 83 -1 
84 85 86 -1 87 88 89 -1 90 91 92 -1 93 94 95 -1 
96 97 98 -1 99 100 101 -1 102 103 104 -1 105 106 107 -1 
108 109 110 -1 111 112 113 -1 114 115 116 -1 117 118 119 -1 
120 121 122 -1 123 124 125 -1 126 127 128 -1 129 130 131 -1 
132 133 134 -1 135 136 137 -1 138 139 140 -1 141 142 143 -1 
144 145 146 -1 147 148 149 -1 150 151 152 -1 153 154 155 -1 
156 157 158 -1 159 160 161 -1 162 163 164 -1 165 166 167 -1 
168 169 170 -1 171 172 173 -1 174 175 176 -1 177 178 179 -1 
180 181 182 -1 183 184 185 -1 186 187 188 -1 189 190 191 -1 
192 193 194 -1 195 196 197 -1 198 199 200 -1 201 202 203 -1 
204 205 206 -1 207 208 209 -1 210 211 212 -1 213 214 215 -1 
216 217 218 -1 219 220 221 -1 222 223 224 -1 225 226 227 -1 
228 229 230 -1 231 232 233 -1 234 235 236 -1 237 238 239 -1 
240 241 242 -1 243 244 245 -1 246 247 248 -1 249 250 251 -1 
252 253 254 -1 255 256 257 -1 258 259 260 -1 261 262 263 -1 
264 265 266 -1 267 268 269 -1 270 271 272 -1 273 274 275 -1 
276 277 278 -1 279 280 281 -1 282 283 284 -1 285 286 287 -1 
288 289 290 -1 291 292 293 -1 294 295 296 -1 297 298 299 -1 
300 301 302 -1 303 304 305 -1 306 307 308 -1 309 310 311 -1 
312 313 314 -1 315 316 317 -1 318 319 320 -1 321 322 323 -1 
324 325 326 -1 327 328 329 -1 330 331 332 -1 333 334 335 -1 
336 337 338 -1 339 340 341 -1 342 343 344 -1 345 346 347 -1 
348 349 350 -1 351 352 353 -1 354 355 356 -1 357 358 359 -1 
360 361 362 -1 363 364 365 -1 366 367 368 -1 369 370 371 -1 
372 373 374 -1 375 376 377 -1 378 379 380 -1 381 382 383 -1 
384 385 386 -1 387 388 389 -1 390 391 392 -1 393 394 395 -1 
396 397 398 -1 399 400 401 -1 402 403 404 -1 405 406 407 -1 
408 409 410 -1 411 412 413 -1 414 415 416 -1 417 418 419 -1 
420 421 422 -1 423 424 425 -1 426 427 428 -1 429 430 431 -1 
432 433 434 -1 435 436 437 -1 438 439 440 -1 441 442 443 -1 
444 445 446 -1 447 448 449 -1 450 451 452 -1 453 454 455 -1 
456 457 458 -1 459 460 461 -1 462 463 464 -1 465 466 467 -1 
468 469 470 -1 471 472 473 -1 474 475 476 -1 477 478 479 -1 
480 481 482 -1 483 484 485 -1 486 487 488 -1 489 490 491 -1 
492 493 494 -1 495 496 497 -1 498 499 500 -1 501 502 503 -1 
504 505 506 -1 507 508 509 -1 510 511 512 -1 513 514 515 -1 
516 517 518 -1 519 520 521 -1 522 523 524 -1 525 526 527 -1 
528 529 530 -1 531 532 533 -1 534 535 536 -1 537 538 539 -1 
540 541 542 -1 543 544 545 -1 546 547 548 -1 549 550 551 -1 
552 553 554 -1 555 556 557 -1 558 559 560 -1 561 562 563 -1 
564 565 566 -1 567 568 569 -1 570 571 572 -1 573 574 575 -1 
576 577 578 -1 579 580 581 -1 582 583 584 -1 585 586 587 -1 
588 589 590 -1 591 592 593 -1 594 595 596 -1 597 598 599 -1 
600 601 602 -1 603 604 605 -1 606 607 608 -1 609 610 611 -1 
612 613 614 -1 615 616 617 -1 618 619 620 -1 621 622 623 -1 
624 625 626 -1 627 628 629 -1 630 631 632 -1 633 634 635 -1 
636 637 638 -1 639 640 641 -1 642 643 644 -1 645 646 647 -1 
648 649 650 -1 651 652 653 -1 654 655 656 -1 657 658 659 -1 
660 661 662 -1 663 664 665 -1 666 667 668 -1 669 670 671 -1 
672 673 674 -1 675 676 677 -1 678 679 680 -1 681 682 683 -1 
684 685 686 -1 687 688 689 -1 690 691 692 -1 693 694 695 -1 
696 697 698 -1 699 700 701 -1 702 703 704 -1 705 706 707 -1 
708 709 710 -1 711 712 713 -1 714 715 716 -1 717 718 719 -1 
720 721 722 -1 723 724 725 -1 726 727 728 -1 729 730 731 -1 
732 733 734 -1 735 736 737 -1 738 739 740 -1 741 742 743 -1 
744 745 746 -1 747 748 749 -1 750 751 752 -1 753 754 755 -1 
756 757 758 -1 759 760 761 -1 762 763 764 -1 765 766 767 -1 
768 769 770 -1 771 772 773 -1 774 775 776 -1 777 778 779 -1 
780 781 782 -1 783 784 785 -1 786 787 788 -1 789 790 791 -1 
792 793 794 -1 795 796 797 -1 798 799 800 -1 801 802 803 -1 
804 805 806 -1 807 808 809 -1 810 811 812 -1 813 814 815 -1 
816 817 818 -1 819 820 821 -1 822 823 824 -1 825 826 827 -1 
828 829 830 -1 831 832 833 -1 834 835 836 -1 837 838 839 -1 
840 841 842 -1 843 844 845 -1 846 847 848 -1 849 850 851 -1 
852 853 854 -1 855 856 857 -1 858 859 860 -1 861 862 863 -1 
864 865 866 -1 867 868 869 -1 870 871 872 -1 873 874 875 -1 
876 877 878 -1 879 880 881 -1 882 883 884 -1 885 886 887 -1 
888 889 890 -1 891 892 893 -1 894 895 896 -1 897 898 899 -1 
900 901 902 -1 903 904 905 -1 906 907 908 -1 909 910 911 -1 
912 913 914 -1 915 916 917 -1 918 919 920 -1 921 922 923 -1 
924 925 926 -1 927 928 929 -1 930 931 932 -1 933 934 935 -1 
936 937 938 -1 939 940 941 -1 942 943 944 -1 945 946 947 -1 
948 949 950 -1 951 952 953 -1 954 955 956 -1 957 958 959 -1 
960 961 962 -1 963 964 965 -1 966 967 968 -1 969 970 971 -1 
972 973 974 -1 975 976 977 -1 978 979 980 -1 981 982 983 -1 
984 985 986 -1 987 988 989 -1 990 991 992 -1 993 994 995 -1 
996 997 998 -1 999 1000 1001 -1 1002 1003 1004 -1 1005 1006 1007 -1 
1008 1009 1010 -1 1011 1012 1013 -1 1014 1015 1016 -1 1017 1018 1019 -1 
1020 1021 1022 -1 1023 1024 1025 -1 1026 1027 1028 -1 1029 1030 1031 -1 
1032 1033 1034 -1 1035 1036 1037 -1 1038 1039 1040 -1 1041 1042 1043 -1 
1044 1045 1046 -1 1047 1048 1049 -1 1050 1051 1052 -1 1053 1054 1055 -1 
1056 1057 1058 -1 1059 1060 1061 -1 1062 1063 1064 -1 1065 1066 1067 -1 
1068 1069 1070 -1 1071 1072 1073 -1 1074 1075 1076 -1 1077 1078 1079 -1 
1080 1081 1082 -1 1083 1084 1085 -1 1086 1087 1088 -1 1089 1090 1091 -1 
1092 1093 1094 -1 1095 1096 1097 -1 1098 1099 1100 -1 1101 1102 1103 -1 
1104 1105 1106 -1 1107 1108 1109 -1 1110 1111 1112 -1 1113 1114 1115 -1 
1116 1117 1118 -1 1119 1120 1121 -1 1122 1123 1124 -1 1125 1126 1127 -1 
1128 1129 1130 -1 1131 1132 1133 -1 1134 1135 1136 1137 -1 1138 1139 1140 1141 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -44.28 24.07 55.13 -44.18 24.15 55.21 -48.59 24.07 60.22 -45.8 22.85 53.81
 -50.25 22.85 58.77 -47.28 21.62 52.44 -51.87 21.62 57.27 -48.72 20.4 51.03
 -53.45 20.4 55.74 -50.12 19.17 49.59 -54.98 19.17 54.15 -51.48 17.94 48.1
 -56.46 17.94 52.53 -52.79 16.72 46.58 -57.9 16.72 50.86 -54.06 15.49 45.02
 -59.29 15.49 49.15 -55.29 14.27 43.42 -60.63 14.27 47.41 -56.47 13.04 41.79
 -61.92 13.04 45.62 -57.6 11.82 40.13 -63.16 11.82 43.8 -58.69 10.59 38.43
 -64.35 10.59 41.95 -59.73 9.36 36.71 -65.49 9.36 40.06 -60.71 8.14 34.95
 -66.57 8.14 38.14 -61.65 6.91 33.17 -67.59 6.91 36.2 -62.54 5.69 31.37
 -68.57 5.69 34.22 -63.38 4.46 29.53 -69.48 4.46 32.22 -64.16 3.24 27.68
 -70.34 3.24 30.19 -64.89 2.01 25.8 -71.14 2.01 28.14 -65.57 0.78 23.91
 -71.88 0.78 26.06 -66.19 -0.44 22 -72.56 -0.44 23.97 -66.76 -1.67 20.06
 -73.18 -1.67 21.86 -67.27 -2.89 18.12 -73.74 -2.89 19.73 -67.73 -4.12 16.16
 -74.24 -4.12 17.58 -68.13 -5.35 14.19 -74.68 -5.35 15.43 -68.48 -6.57 12.2
 -75.06 -6.57 13.26 -68.77 -7.8 10.21 -75.38 -7.8 11.08 -69 -9.02 8.21
 -75.63 -9.02 8.89 -69.18 -10.25 6.21 -75.83 -10.25 6.7 -69.3 -11.47 4.2
 -75.96 -11.47 4.5 -69.36 -12.7 2.19 -76.03 -12.7 2.3 -69.36 -13.93 0.17
 -76.03 -13.93 0.1 -69.31 -15.15 -1.84 -75.97 -15.15 -2.11 -69.2 -16.38 -3.85
 -75.86 -16.38 -4.3 -69.04 -17.6 -5.85 -75.67 -17.6 -6.5 -68.82 -18.83 -7.86
 -75.43 -18.83 -8.69 -68.54 -20.05 -9.85 -75.13 -20.05 -10.87 -68.2 -21.28 -11.83
 -74.76 -21.28 -13.04 -67.81 -22.51 -13.81 -74.33 -22.51 -15.2 -67.36 -23.73 -15.77
 -73.84 -23.73 -17.35 -66.86 -24.96 -17.72 -73.29 -24.96 -19.48 -66.3 -26.18 -19.65
 -72.68 -26.18 -21.59 -65.69 -27.41 -21.57 -72.01 -27.41 -23.69 -65.02 -28.63 -23.47
 -71.28 -28.63 -25.77 -64.3 -29.86 -25.35 -70.49 -29.86 -27.82 -63.53 -31.09 -27.21
 -69.64 -31.09 -29.86 -62.7 -32.31 -29.04 -62.55 -32.52 -29.36 -68.74 -32.31 -31.86
 -68.52 -32.6 -32.33 -50.12 27.41 58.89 -51.74 26.18 57.4 -53.32 24.95 55.86
 -54.86 23.73 54.28 -56.34 22.5 52.66 -57.79 21.28 50.99 -59.18 20.05 49.29
 -60.53 18.83 47.55 -61.82 17.6 45.77 -63.07 16.37 43.95 -64.26 15.15 42.1
 -65.4 13.92 40.21 -66.48 12.7 38.3 -67.51 11.47 36.35 -68.49 10.25 34.38
 -69.41 9.02 32.38 -70.27 7.79 30.35 -71.07 6.57 28.3 -71.82 5.34 26.23
 -72.51 4.12 24.14 -73.13 2.89 22.03 -73.7 1.67 19.9 -74.2 0.44 17.76
 -74.65 -0.79 15.6 -75.03 -2.01 13.43 -75.36 -3.24 11.25 -75.62 -4.46 9.07
 -75.81 -5.69 6.87 -75.95 -6.91 4.68 -76.02 -8.14 2.47 -76.03 -9.37 0.27
 -75.98 -10.59 -1.93 -75.87 -11.82 -4.13 -75.69 -13.04 -6.32 -75.45 -14.27 -8.51
 -75.15 -15.49 -10.69 -74.79 -16.72 -12.86 -74.37 -17.95 -15.03 -73.88 -19.17 -17.17
 -73.34 -20.4 -19.31 -72.73 -21.62 -21.42 -72.06 -22.85 -23.52 -71.34 -24.07 -25.6
 -70.56 -25.3 -27.66 -69.71 -26.53 -29.69 -68.81 -27.75 -31.7 -67.86 -28.98 -33.69
 -67.62 -29.27 -34.16 -47.16 26.18 52.55 -45.68 27.41 53.91 -48.61 24.95 51.15
 -50.01 23.73 49.7 -51.37 22.5 48.22 -52.69 21.28 46.7 -53.96 20.05 45.14
 -55.19 18.83 43.55 -56.38 17.6 41.92 -57.51 16.37 40.26 -58.6 15.15 38.57
 -59.64 13.92 36.85 -60.64 12.7 35.09 -61.58 11.47 33.32 -62.47 10.25 31.51
 -63.31 9.02 29.68 -64.1 7.79 27.83 -64.83 6.57 25.96 -65.51 5.34 24.06
 -66.14 4.12 22.15 -66.71 2.89 20.22 -67.23 1.67 18.27 -67.69 0.44 16.32
 -68.1 -0.79 14.34 -68.45 -2.01 12.36 -68.75 -3.24 10.37 -68.98 -4.46 8.37
 -69.16 -5.69 6.37 -69.29 -6.91 4.36 -69.36 -8.14 2.35 -69.37 -9.37 0.33
 -69.32 -10.59 -1.68 -69.21 -11.82 -3.69 -69.05 -13.04 -5.69 -68.84 -14.27 -7.7
 -68.56 -15.49 -9.69 -68.23 -16.72 -11.67 -67.84 -17.95 -13.65 -67.4 -19.17 -15.61
 -66.9 -20.4 -17.56 -66.35 -21.62 -19.5 -65.74 -22.85 -21.42 -65.07 -24.07 -23.32
 -64.36 -25.3 -25.2 -63.59 -26.53 -27.06 -62.77 -27.75 -28.9 -61.89 -28.98 -30.71
 -61.68 -29.27 -31.14"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0.08 0 0.08 0 -0.09 0.05 0.08 0.01 0.08 0 -0.09 0.05 -0.09 0.05 0.08 0 -0.09 0.09 0.08 0.05 0.08 0.05 -0.09 
0.09 -0.09 0.09 0.08 0.05 -0.09 0.13 0.08 0.09 0.08 0.09 -0.09 0.13 -0.09 0.13 0.08 0.09 -0.09 0.17 0.08 0.13 0.08 0.13 -0.09 
0.17 -0.09 0.17 0.08 0.13 -0.09 0.21 0.08 0.17 0.08 0.17 -0.09 0.21 -0.09 0.21 0.08 0.17 -0.09 0.26 0.08 0.22 0.08 0.21 -0.09 
0.26 -0.09 0.26 0.08 0.21 -0.09 0.3 0.08 0.26 0.08 0.26 -0.09 0.3 -0.09 0.3 0.08 0.26 -0.09 0.34 0.08 0.3 0.08 0.3 -0.09 
0.34 -0.09 0.34 0.08 0.3 -0.09 0.38 0.08 0.34 0.08 0.34 -0.09 0.38 -0.09 0.38 0.08 0.34 -0.09 0.42 0.08 0.38 0.08 0.38 -0.09 
0.42 -0.09 0.42 0.08 0.38 -0.09 0.47 0.08 0.43 0.08 0.42 -0.09 0.47 -0.09 0.47 0.08 0.42 -0.09 0.51 0.08 0.47 0.08 0.47 -0.09 
0.51 -0.09 0.51 0.08 0.47 -0.09 0.55 0.08 0.51 0.08 0.51 -0.09 0.55 -0.09 0.55 0.08 0.51 -0.09 0.59 0.08 0.55 0.08 0.55 -0.09 
0.59 -0.09 0.59 0.08 0.55 -0.09 0.63 0.08 0.59 0.08 0.59 -0.09 0.63 -0.09 0.63 0.08 0.59 -0.09 0.68 0.08 0.64 0.08 0.63 -0.09 
0.68 -0.09 0.68 0.08 0.63 -0.09 0.72 0.08 0.68 0.08 0.68 -0.09 0.72 -0.09 0.72 0.08 0.68 -0.09 0.76 0.08 0.72 0.08 0.72 -0.09 
0.76 -0.09 0.76 0.08 0.72 -0.09 0.8 0.08 0.76 0.08 0.76 -0.09 0.8 -0.09 0.8 0.08 0.76 -0.09 0.84 0.08 0.8 0.08 0.8 -0.09 
0.84 -0.09 0.84 0.08 0.8 -0.09 0.89 0.08 0.85 0.08 0.84 -0.09 0.89 -0.09 0.89 0.08 0.84 -0.09 0.93 0.08 0.89 0.08 0.89 -0.09 
0.93 -0.09 0.93 0.08 0.89 -0.09 0.97 0.08 0.93 0.08 0.93 -0.09 0.97 -0.09 0.97 0.08 0.93 -0.09 1.01 0.08 0.97 0.08 0.97 -0.09 
1.01 -0.09 1.01 0.08 0.97 -0.09 1.05 0.08 1.01 0.08 1.01 -0.09 1.06 -0.09 1.05 0.08 1.01 -0.09 1.1 0.08 1.06 0.08 1.06 -0.09 
1.1 -0.09 1.1 0.08 1.06 -0.09 1.14 0.08 1.1 0.08 1.1 -0.09 1.14 -0.09 1.14 0.08 1.1 -0.09 1.18 0.08 1.14 0.08 1.14 -0.09 
1.18 -0.09 1.18 0.08 1.14 -0.09 1.22 0.08 1.18 0.08 1.18 -0.09 1.22 -0.09 1.22 0.08 1.18 -0.09 1.26 0.08 1.22 0.08 1.22 -0.09 
1.27 -0.09 1.26 0.08 1.22 -0.09 1.31 0.08 1.27 0.08 1.27 -0.09 1.31 -0.09 1.31 0.08 1.27 -0.09 1.35 0.08 1.31 0.08 1.31 -0.09 
1.35 -0.09 1.35 0.08 1.31 -0.09 1.39 0.08 1.35 0.08 1.35 -0.09 1.39 -0.09 1.39 0.08 1.35 -0.09 1.43 0.08 1.39 0.08 1.39 -0.09 
1.43 -0.09 1.43 0.08 1.39 -0.09 1.47 0.08 1.43 0.08 1.43 -0.09 1.48 -0.09 1.47 0.08 1.43 -0.09 1.52 0.08 1.48 0.08 1.48 -0.09 
1.52 -0.09 1.52 0.08 1.48 -0.09 1.56 0.08 1.52 0.08 1.52 -0.09 1.56 -0.09 1.56 0.08 1.52 -0.09 1.6 0.08 1.56 0.08 1.56 -0.09 
1.6 -0.09 1.6 0.08 1.56 -0.09 1.64 0.08 1.6 0.08 1.6 -0.09 1.64 -0.09 1.64 0.08 1.6 -0.09 1.68 0.08 1.64 0.08 1.64 -0.09 
1.69 -0.09 1.68 0.08 1.64 -0.09 1.73 0.08 1.69 0.08 1.69 -0.09 1.73 -0.09 1.73 0.08 1.69 -0.09 1.77 0.08 1.73 0.08 1.73 -0.09 
1.77 -0.09 1.77 0.08 1.73 -0.09 1.81 0.08 1.77 0.08 1.77 -0.09 1.81 -0.09 1.81 0.08 1.77 -0.09 1.85 0.08 1.81 0.08 1.81 -0.09 
1.85 -0.09 1.85 0.08 1.81 -0.09 1.89 0.08 1.85 0.08 1.85 -0.09 1.9 -0.09 1.89 0.08 1.85 -0.09 1.94 0.08 1.9 0.08 1.9 -0.09 
1.94 0.07 1.94 0.07 1.9 -0.09 1.94 -0.09 1.94 0.08 1.9 -0.09 1.95 -0.09 1.94 0.08 1.94 -0.09 0.04 -0.16 0 -0.16 0 -0.26 
0.05 -0.26 0.04 -0.16 0 -0.26 0.09 -0.16 0.04 -0.16 0.05 -0.26 0.09 -0.26 0.09 -0.16 0.05 -0.26 0.13 -0.16 0.09 -0.16 0.09 -0.26 
0.13 -0.26 0.13 -0.16 0.09 -0.26 0.17 -0.16 0.13 -0.16 0.13 -0.26 0.17 -0.26 0.17 -0.16 0.13 -0.26 0.21 -0.16 0.17 -0.16 0.17 -0.26 
0.21 -0.26 0.21 -0.16 0.17 -0.26 0.25 -0.16 0.21 -0.16 0.21 -0.26 0.26 -0.26 0.25 -0.16 0.21 -0.26 0.3 -0.16 0.25 -0.16 0.26 -0.26 
0.3 -0.26 0.3 -0.16 0.26 -0.26 0.34 -0.16 0.3 -0.16 0.3 -0.26 0.34 -0.26 0.34 -0.16 0.3 -0.26 0.38 -0.16 0.34 -0.16 0.34 -0.26 
0.38 -0.26 0.38 -0.16 0.34 -0.26 0.42 -0.16 0.38 -0.16 0.38 -0.26 0.42 -0.26 0.42 -0.16 0.38 -0.26 0.46 -0.16 0.42 -0.16 0.42 -0.26 
0.47 -0.26 0.46 -0.16 0.42 -0.26 0.51 -0.16 0.46 -0.16 0.47 -0.26 0.51 -0.26 0.51 -0.16 0.47 -0.26 0.55 -0.16 0.51 -0.16 0.51 -0.26 
0.55 -0.26 0.55 -0.16 0.51 -0.26 0.59 -0.16 0.55 -0.16 0.55 -0.26 0.59 -0.26 0.59 -0.16 0.55 -0.26 0.63 -0.16 0.59 -0.16 0.59 -0.26 
0.63 -0.26 0.63 -0.16 0.59 -0.26 0.67 -0.16 0.63 -0.16 0.63 -0.26 0.68 -0.26 0.67 -0.16 0.63 -0.26 0.72 -0.16 0.67 -0.16 0.68 -0.26 
0.72 -0.26 0.72 -0.16 0.68 -0.26 0.76 -0.16 0.72 -0.16 0.72 -0.26 0.76 -0.26 0.76 -0.16 0.72 -0.26 0.8 -0.16 0.76 -0.16 0.76 -0.26 
0.8 -0.26 0.8 -0.16 0.76 -0.26 0.84 -0.16 0.8 -0.16 0.8 -0.26 0.84 -0.26 0.84 -0.16 0.8 -0.26 0.88 -0.16 0.84 -0.16 0.84 -0.26 
0.89 -0.26 0.88 -0.16 0.84 -0.26 0.93 -0.16 0.88 -0.16 0.89 -0.26 0.93 -0.26 0.93 -0.16 0.89 -0.26 0.97 -0.16 0.93 -0.16 0.93 -0.26 
0.97 -0.26 0.97 -0.16 0.93 -0.26 1.01 -0.16 0.97 -0.16 0.97 -0.26 1.01 -0.26 1.01 -0.16 0.97 -0.26 1.05 -0.16 1.01 -0.16 1.01 -0.26 
1.05 -0.26 1.05 -0.16 1.01 -0.26 1.09 -0.16 1.05 -0.16 1.05 -0.26 1.1 -0.26 1.09 -0.16 1.05 -0.26 1.14 -0.16 1.09 -0.16 1.1 -0.26 
1.14 -0.26 1.14 -0.16 1.1 -0.26 1.18 -0.16 1.14 -0.16 1.14 -0.26 1.18 -0.26 1.18 -0.16 1.14 -0.26 1.22 -0.16 1.18 -0.16 1.18 -0.26 
1.22 -0.26 1.22 -0.16 1.18 -0.26 1.26 -0.16 1.22 -0.16 1.22 -0.26 1.26 -0.26 1.26 -0.16 1.22 -0.26 1.3 -0.16 1.26 -0.16 1.26 -0.26 
1.31 -0.26 1.3 -0.16 1.26 -0.26 1.35 -0.16 1.3 -0.16 1.31 -0.26 1.35 -0.26 1.35 -0.16 1.31 -0.26 1.39 -0.16 1.35 -0.16 1.35 -0.26 
1.39 -0.26 1.39 -0.16 1.35 -0.26 1.43 -0.16 1.39 -0.16 1.39 -0.26 1.43 -0.26 1.43 -0.16 1.39 -0.26 1.47 -0.16 1.43 -0.16 1.43 -0.26 
1.47 -0.26 1.47 -0.16 1.43 -0.26 1.51 -0.16 1.47 -0.16 1.47 -0.26 1.52 -0.26 1.51 -0.16 1.47 -0.26 1.56 -0.16 1.51 -0.16 1.52 -0.26 
1.56 -0.26 1.56 -0.16 1.52 -0.26 1.6 -0.16 1.56 -0.16 1.56 -0.26 1.6 -0.26 1.6 -0.16 1.56 -0.26 1.64 -0.16 1.6 -0.16 1.6 -0.26 
1.64 -0.26 1.64 -0.16 1.6 -0.26 1.68 -0.16 1.64 -0.16 1.64 -0.26 1.68 -0.26 1.68 -0.16 1.64 -0.26 1.72 -0.16 1.68 -0.16 1.68 -0.26 
1.73 -0.26 1.72 -0.16 1.68 -0.26 1.77 -0.16 1.72 -0.16 1.73 -0.26 1.77 -0.26 1.77 -0.16 1.73 -0.26 1.81 -0.16 1.77 -0.16 1.77 -0.26 
1.81 -0.26 1.81 -0.16 1.77 -0.26 1.85 -0.16 1.81 -0.16 1.81 -0.26 1.85 -0.26 1.85 -0.16 1.81 -0.26 1.89 -0.16 1.85 -0.16 1.85 -0.26 
1.89 -0.26 1.89 -0.16 1.85 -0.26 1.93 -0.16 1.89 -0.16 1.89 -0.26 1.94 -0.16 1.93 -0.16 1.89 -0.26 1.94 -0.26 1.94 -0.16 1.89 -0.26 
1.95 -0.26 1.94 -0.16 1.94 -0.26 0.04 -0.36 0 -0.19 0 -0.36 0.05 -0.19 0 -0.19 0.04 -0.36 0.08 -0.36 0.04 -0.19 0.04 -0.36 
0.08 -0.19 0.04 -0.19 0.08 -0.36 0.12 -0.36 0.08 -0.19 0.08 -0.36 0.12 -0.19 0.08 -0.19 0.12 -0.36 0.16 -0.36 0.12 -0.19 0.12 -0.36 
0.16 -0.19 0.12 -0.19 0.16 -0.36 0.2 -0.36 0.16 -0.19 0.16 -0.36 0.2 -0.19 0.16 -0.19 0.2 -0.36 0.24 -0.36 0.2 -0.19 0.2 -0.36 
0.24 -0.19 0.2 -0.19 0.24 -0.36 0.28 -0.36 0.24 -0.19 0.24 -0.36 0.28 -0.19 0.24 -0.19 0.28 -0.36 0.32 -0.36 0.28 -0.19 0.28 -0.36 
0.32 -0.19 0.28 -0.19 0.32 -0.36 0.36 -0.36 0.32 -0.19 0.32 -0.36 0.36 -0.19 0.32 -0.19 0.36 -0.36 0.4 -0.36 0.36 -0.19 0.36 -0.36 
0.4 -0.19 0.36 -0.19 0.4 -0.36 0.44 -0.36 0.4 -0.19 0.4 -0.36 0.44 -0.19 0.4 -0.19 0.44 -0.36 0.48 -0.36 0.44 -0.19 0.44 -0.36 
0.48 -0.19 0.44 -0.19 0.48 -0.36 0.52 -0.36 0.47 -0.19 0.48 -0.36 0.52 -0.19 0.47 -0.19 0.52 -0.36 0.55 -0.36 0.51 -0.19 0.52 -0.36 
0.56 -0.19 0.51 -0.19 0.55 -0.36 0.59 -0.36 0.55 -0.19 0.55 -0.36 0.6 -0.19 0.55 -0.19 0.59 -0.36 0.63 -0.36 0.59 -0.19 0.59 -0.36 
0.63 -0.19 0.59 -0.19 0.63 -0.36 0.67 -0.36 0.63 -0.19 0.63 -0.36 0.67 -0.19 0.63 -0.19 0.67 -0.36 0.71 -0.36 0.67 -0.19 0.67 -0.36 
0.71 -0.19 0.67 -0.19 0.71 -0.36 0.75 -0.36 0.71 -0.19 0.71 -0.36 0.75 -0.19 0.71 -0.19 0.75 -0.36 0.79 -0.36 0.75 -0.19 0.75 -0.36 
0.79 -0.19 0.75 -0.19 0.79 -0.36 0.83 -0.36 0.79 -0.19 0.79 -0.36 0.83 -0.19 0.79 -0.19 0.83 -0.36 0.87 -0.36 0.83 -0.19 0.83 -0.36 
0.87 -0.19 0.83 -0.19 0.87 -0.36 0.91 -0.36 0.87 -0.19 0.87 -0.36 0.91 -0.19 0.87 -0.19 0.91 -0.36 0.95 -0.36 0.91 -0.19 0.91 -0.36 
0.95 -0.19 0.91 -0.19 0.95 -0.36 0.99 -0.36 0.95 -0.19 0.95 -0.36 0.99 -0.19 0.95 -0.19 0.99 -0.36 1.03 -0.36 0.99 -0.19 0.99 -0.36 
1.03 -0.19 0.99 -0.19 1.03 -0.36 1.07 -0.36 1.02 -0.19 1.03 -0.36 1.07 -0.19 1.02 -0.19 1.07 -0.36 1.1 -0.36 1.06 -0.19 1.07 -0.36 
1.11 -0.19 1.06 -0.19 1.1 -0.36 1.14 -0.36 1.1 -0.19 1.1 -0.36 1.15 -0.19 1.1 -0.19 1.14 -0.36 1.18 -0.36 1.14 -0.19 1.14 -0.36 
1.18 -0.19 1.14 -0.19 1.18 -0.36 1.22 -0.36 1.18 -0.19 1.18 -0.36 1.22 -0.19 1.18 -0.19 1.22 -0.36 1.26 -0.36 1.22 -0.19 1.22 -0.36 
1.26 -0.19 1.22 -0.19 1.26 -0.36 1.3 -0.36 1.26 -0.19 1.26 -0.36 1.3 -0.19 1.26 -0.19 1.3 -0.36 1.34 -0.36 1.3 -0.19 1.3 -0.36 
1.34 -0.19 1.3 -0.19 1.34 -0.36 1.38 -0.36 1.34 -0.19 1.34 -0.36 1.38 -0.19 1.34 -0.19 1.38 -0.36 1.42 -0.36 1.38 -0.19 1.38 -0.36 
1.42 -0.19 1.38 -0.19 1.42 -0.36 1.46 -0.36 1.42 -0.19 1.42 -0.36 1.46 -0.19 1.42 -0.19 1.46 -0.36 1.5 -0.36 1.46 -0.19 1.46 -0.36 
1.5 -0.19 1.46 -0.19 1.5 -0.36 1.54 -0.36 1.5 -0.19 1.5 -0.36 1.54 -0.19 1.5 -0.19 1.54 -0.36 1.58 -0.36 1.54 -0.19 1.54 -0.36 
1.58 -0.19 1.54 -0.19 1.58 -0.36 1.62 -0.36 1.57 -0.19 1.58 -0.36 1.62 -0.19 1.57 -0.19 1.62 -0.36 1.65 -0.36 1.61 -0.19 1.62 -0.36 
1.66 -0.19 1.61 -0.19 1.65 -0.36 1.69 -0.36 1.65 -0.19 1.65 -0.36 1.7 -0.19 1.65 -0.19 1.69 -0.36 1.73 -0.36 1.69 -0.19 1.69 -0.36 
1.73 -0.19 1.69 -0.19 1.73 -0.36 1.77 -0.36 1.73 -0.19 1.73 -0.36 1.77 -0.19 1.73 -0.19 1.77 -0.36 1.81 -0.36 1.77 -0.19 1.77 -0.36 
1.82 -0.36 1.77 -0.19 1.81 -0.36 1.81 -0.19 1.77 -0.19 1.82 -0.36 1.82 -0.19 1.81 -0.19 1.82 -0.36 0.01 -0.53 0 -0.43 0 -0.53 
0.04 -0.43 0 -0.43 0.01 -0.53 0.05 -0.53 0.04 -0.43 0.01 -0.53 0.08 -0.43 0.04 -0.43 0.05 -0.53 0.09 -0.53 0.08 -0.43 0.05 -0.53 
0.12 -0.43 0.08 -0.43 0.09 -0.53 0.13 -0.53 0.12 -0.43 0.09 -0.53 0.16 -0.43 0.12 -0.43 0.13 -0.53 0.16 -0.53 0.16 -0.43 0.13 -0.53 
0.2 -0.43 0.16 -0.43 0.16 -0.53 0.2 -0.53 0.2 -0.43 0.16 -0.53 0.24 -0.43 0.2 -0.43 0.2 -0.53 0.24 -0.53 0.24 -0.43 0.2 -0.53 
0.28 -0.43 0.24 -0.43 0.24 -0.53 0.28 -0.53 0.28 -0.43 0.24 -0.53 0.32 -0.43 0.28 -0.43 0.28 -0.53 0.32 -0.53 0.32 -0.43 0.28 -0.53 
0.36 -0.43 0.32 -0.43 0.32 -0.53 0.36 -0.53 0.36 -0.43 0.32 -0.53 0.4 -0.43 0.36 -0.43 0.36 -0.53 0.4 -0.53 0.4 -0.43 0.36 -0.53 
0.44 -0.43 0.4 -0.43 0.4 -0.53 0.44 -0.53 0.44 -0.43 0.4 -0.53 0.48 -0.43 0.44 -0.43 0.44 -0.53 0.48 -0.53 0.48 -0.43 0.44 -0.53 
0.52 -0.43 0.48 -0.43 0.48 -0.53 0.52 -0.53 0.52 -0.43 0.48 -0.53 0.55 -0.43 0.52 -0.43 0.52 -0.53 0.56 -0.53 0.55 -0.43 0.52 -0.53 
0.59 -0.43 0.55 -0.43 0.56 -0.53 0.6 -0.53 0.59 -0.43 0.56 -0.53 0.63 -0.43 0.59 -0.43 0.6 -0.53 0.64 -0.53 0.63 -0.43 0.6 -0.53 
0.67 -0.43 0.63 -0.43 0.64 -0.53 0.68 -0.53 0.67 -0.43 0.64 -0.53 0.71 -0.43 0.67 -0.43 0.68 -0.53 0.71 -0.53 0.71 -0.43 0.68 -0.53 
0.75 -0.43 0.71 -0.43 0.71 -0.53 0.75 -0.53 0.75 -0.43 0.71 -0.53 0.79 -0.43 0.75 -0.43 0.75 -0.53 0.79 -0.53 0.79 -0.43 0.75 -0.53 
0.83 -0.43 0.79 -0.43 0.79 -0.53 0.83 -0.53 0.83 -0.43 0.79 -0.53 0.87 -0.43 0.83 -0.43 0.83 -0.53 0.87 -0.53 0.87 -0.43 0.83 -0.53 
0.91 -0.43 0.87 -0.43 0.87 -0.53 0.91 -0.53 0.91 -0.43 0.87 -0.53 0.95 -0.43 0.91 -0.43 0.91 -0.53 0.95 -0.53 0.95 -0.43 0.91 -0.53 
0.99 -0.43 0.95 -0.43 0.95 -0.53 0.99 -0.53 0.99 -0.43 0.95 -0.53 1.03 -0.43 0.99 -0.43 0.99 -0.53 1.03 -0.53 1.03 -0.43 0.99 -0.53 
1.07 -0.43 1.03 -0.43 1.03 -0.53 1.07 -0.53 1.07 -0.43 1.03 -0.53 1.1 -0.43 1.07 -0.43 1.07 -0.53 1.11 -0.53 1.1 -0.43 1.07 -0.53 
1.14 -0.43 1.1 -0.43 1.11 -0.53 1.15 -0.53 1.14 -0.43 1.11 -0.53 1.18 -0.43 1.14 -0.43 1.15 -0.53 1.19 -0.53 1.18 -0.43 1.15 -0.53 
1.22 -0.43 1.18 -0.43 1.19 -0.53 1.23 -0.53 1.22 -0.43 1.19 -0.53 1.26 -0.43 1.22 -0.43 1.23 -0.53 1.26 -0.53 1.26 -0.43 1.23 -0.53 
1.3 -0.43 1.26 -0.43 1.26 -0.53 1.3 -0.53 1.3 -0.43 1.26 -0.53 1.34 -0.43 1.3 -0.43 1.3 -0.53 1.34 -0.53 1.34 -0.43 1.3 -0.53 
1.38 -0.43 1.34 -0.43 1.34 -0.53 1.38 -0.53 1.38 -0.43 1.34 -0.53 1.42 -0.43 1.38 -0.43 1.38 -0.53 1.42 -0.53 1.42 -0.43 1.38 -0.53 
1.46 -0.43 1.42 -0.43 1.42 -0.53 1.46 -0.53 1.46 -0.43 1.42 -0.53 1.5 -0.43 1.46 -0.43 1.46 -0.53 1.5 -0.53 1.5 -0.43 1.46 -0.53 
1.54 -0.43 1.5 -0.43 1.5 -0.53 1.54 -0.53 1.54 -0.43 1.5 -0.53 1.58 -0.43 1.54 -0.43 1.54 -0.53 1.58 -0.53 1.58 -0.43 1.54 -0.53 
1.62 -0.43 1.58 -0.43 1.58 -0.53 1.62 -0.53 1.62 -0.43 1.58 -0.53 1.65 -0.43 1.62 -0.43 1.62 -0.53 1.66 -0.53 1.65 -0.43 1.62 -0.53 
1.69 -0.43 1.65 -0.43 1.66 -0.53 1.7 -0.53 1.69 -0.43 1.66 -0.53 1.73 -0.43 1.69 -0.43 1.7 -0.53 1.74 -0.53 1.73 -0.43 1.7 -0.53 
1.77 -0.43 1.73 -0.43 1.74 -0.53 1.77 -0.53 1.77 -0.43 1.74 -0.53 1.81 -0.43 1.77 -0.43 1.77 -0.53 1.82 -0.43 1.81 -0.43 1.77 -0.53 
1.81 -0.53 1.82 -0.43 1.77 -0.53 1.82 -0.53 1.82 -0.43 1.81 -0.53 0.12 0 0 0 0 -0.09 0.12 -0.09 0.07 0 0 0 0 -0.16 0.07 -0.16
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="handrailTex"></texture>
                    <material is="x3d" use="handrailMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 3 0 2 -1 4 3 2 -1 5 3 4 -1 
6 5 4 -1 7 5 6 -1 8 7 6 -1 9 7 8 -1 
10 9 8 -1 11 9 10 -1 12 11 10 -1 13 11 12 -1 
14 13 12 -1 15 13 14 -1 16 15 14 -1 17 15 16 -1 
18 17 16 -1 19 17 18 -1 20 19 18 -1 21 19 20 -1 
22 21 20 -1 23 21 22 -1 24 23 22 -1 25 23 24 -1 
26 25 24 -1 27 25 26 -1 28 27 26 -1 29 27 28 -1 
30 29 28 -1 31 29 30 -1 32 31 30 -1 33 31 32 -1 
34 33 32 -1 35 33 34 -1 36 35 34 -1 37 35 36 -1 
38 37 36 -1 39 37 38 -1 40 39 38 -1 41 39 40 -1 
42 41 40 -1 43 41 42 -1 44 43 42 -1 45 43 44 -1 
46 45 44 -1 47 45 46 -1 48 47 46 -1 49 47 48 -1 
50 49 48 -1 51 49 50 -1 52 51 50 -1 53 51 52 -1 
54 53 52 -1 55 53 54 -1 56 55 54 -1 57 55 56 -1 
58 57 56 -1 59 57 58 -1 60 59 58 -1 61 59 60 -1 
62 61 60 -1 63 61 62 -1 64 63 62 -1 65 63 64 -1 
66 65 64 -1 67 65 66 -1 68 67 66 -1 69 67 68 -1 
70 69 68 -1 71 69 70 -1 72 71 70 -1 73 71 72 -1 
74 73 72 -1 75 73 74 -1 76 75 74 -1 77 75 76 -1 
78 77 76 -1 79 77 78 -1 80 79 78 -1 81 79 80 -1 
82 81 80 -1 83 81 82 -1 84 83 82 -1 85 83 84 -1 
86 85 84 -1 87 85 86 -1 88 87 86 -1 89 87 88 -1 
90 89 88 -1 91 90 88 -1 92 90 91 -1 93 90 92 -1 
94 93 92 -1 95 93 94 -1 96 95 94 -1 4 2 97 -1 
98 4 97 -1 6 4 98 -1 99 6 98 -1 8 6 99 -1 
100 8 99 -1 10 8 100 -1 101 10 100 -1 12 10 101 -1 
102 12 101 -1 14 12 102 -1 103 14 102 -1 16 14 103 -1 
104 16 103 -1 18 16 104 -1 105 18 104 -1 20 18 105 -1 
106 20 105 -1 22 20 106 -1 107 22 106 -1 24 22 107 -1 
108 24 107 -1 26 24 108 -1 109 26 108 -1 28 26 109 -1 
110 28 109 -1 30 28 110 -1 111 30 110 -1 32 30 111 -1 
112 32 111 -1 34 32 112 -1 113 34 112 -1 36 34 113 -1 
114 36 113 -1 38 36 114 -1 115 38 114 -1 40 38 115 -1 
116 40 115 -1 42 40 116 -1 117 42 116 -1 44 42 117 -1 
118 44 117 -1 46 44 118 -1 119 46 118 -1 48 46 119 -1 
120 48 119 -1 50 48 120 -1 121 50 120 -1 52 50 121 -1 
122 52 121 -1 54 52 122 -1 123 54 122 -1 56 54 123 -1 
124 56 123 -1 58 56 124 -1 125 58 124 -1 60 58 125 -1 
126 60 125 -1 62 60 126 -1 127 62 126 -1 64 62 127 -1 
128 64 127 -1 66 64 128 -1 129 66 128 -1 68 66 129 -1 
130 68 129 -1 70 68 130 -1 131 70 130 -1 72 70 131 -1 
132 72 131 -1 74 72 132 -1 133 74 132 -1 76 74 133 -1 
134 76 133 -1 78 76 134 -1 135 78 134 -1 80 78 135 -1 
136 80 135 -1 82 80 136 -1 137 82 136 -1 84 82 137 -1 
138 84 137 -1 86 84 138 -1 139 86 138 -1 88 86 139 -1 
140 88 139 -1 91 88 140 -1 92 91 140 -1 141 92 140 -1 
142 92 141 -1 94 92 142 -1 96 94 142 -1 143 97 144 -1 
98 97 143 -1 145 98 143 -1 99 98 145 -1 146 99 145 -1 
100 99 146 -1 147 100 146 -1 101 100 147 -1 148 101 147 -1 
102 101 148 -1 149 102 148 -1 103 102 149 -1 150 103 149 -1 
104 103 150 -1 151 104 150 -1 105 104 151 -1 152 105 151 -1 
106 105 152 -1 153 106 152 -1 107 106 153 -1 154 107 153 -1 
108 107 154 -1 155 108 154 -1 109 108 155 -1 156 109 155 -1 
110 109 156 -1 157 110 156 -1 111 110 157 -1 158 111 157 -1 
112 111 158 -1 159 112 158 -1 113 112 159 -1 160 113 159 -1 
114 113 160 -1 161 114 160 -1 115 114 161 -1 162 115 161 -1 
116 115 162 -1 163 116 162 -1 117 116 163 -1 164 117 163 -1 
118 117 164 -1 165 118 164 -1 119 118 165 -1 166 119 165 -1 
120 119 166 -1 167 120 166 -1 121 120 167 -1 168 121 167 -1 
122 121 168 -1 169 122 168 -1 123 122 169 -1 170 123 169 -1 
124 123 170 -1 171 124 170 -1 125 124 171 -1 172 125 171 -1 
126 125 172 -1 173 126 172 -1 127 126 173 -1 174 127 173 -1 
128 127 174 -1 175 128 174 -1 129 128 175 -1 176 129 175 -1 
130 129 176 -1 177 130 176 -1 131 130 177 -1 178 131 177 -1 
132 131 178 -1 179 132 178 -1 133 132 179 -1 180 133 179 -1 
134 133 180 -1 181 134 180 -1 135 134 181 -1 182 135 181 -1 
136 135 182 -1 183 136 182 -1 137 136 183 -1 184 137 183 -1 
138 137 184 -1 185 138 184 -1 139 138 185 -1 186 139 185 -1 
140 139 186 -1 187 140 186 -1 188 140 187 -1 141 140 188 -1 
142 141 188 -1 0 144 1 -1 143 144 0 -1 3 143 0 -1 
145 143 3 -1 5 145 3 -1 146 145 5 -1 7 146 5 -1 
147 146 7 -1 9 147 7 -1 148 147 9 -1 11 148 9 -1 
149 148 11 -1 13 149 11 -1 150 149 13 -1 15 150 13 -1 
151 150 15 -1 17 151 15 -1 152 151 17 -1 19 152 17 -1 
153 152 19 -1 21 153 19 -1 154 153 21 -1 23 154 21 -1 
155 154 23 -1 25 155 23 -1 156 155 25 -1 27 156 25 -1 
157 156 27 -1 29 157 27 -1 158 157 29 -1 31 158 29 -1 
159 158 31 -1 33 159 31 -1 160 159 33 -1 35 160 33 -1 
161 160 35 -1 37 161 35 -1 162 161 37 -1 39 162 37 -1 
163 162 39 -1 41 163 39 -1 164 163 41 -1 43 164 41 -1 
165 164 43 -1 45 165 43 -1 166 165 45 -1 47 166 45 -1 
167 166 47 -1 49 167 47 -1 168 167 49 -1 51 168 49 -1 
169 168 51 -1 53 169 51 -1 170 169 53 -1 55 170 53 -1 
171 170 55 -1 57 171 55 -1 172 171 57 -1 59 172 57 -1 
173 172 59 -1 61 173 59 -1 174 173 61 -1 63 174 61 -1 
175 174 63 -1 65 175 63 -1 176 175 65 -1 67 176 65 -1 
177 176 67 -1 69 177 67 -1 178 177 69 -1 71 178 69 -1 
179 178 71 -1 73 179 71 -1 180 179 73 -1 75 180 73 -1 
181 180 75 -1 77 181 75 -1 182 181 77 -1 79 182 77 -1 
183 182 79 -1 81 183 79 -1 184 183 81 -1 83 184 81 -1 
185 184 83 -1 85 185 83 -1 186 185 85 -1 87 186 85 -1 
187 186 87 -1 188 187 87 -1 89 188 87 -1 90 188 89 -1 
93 188 90 -1 95 188 93 -1 144 97 2 1 -1 96 142 188 95 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 -1 6 7 8 -1 9 10 11 -1 
12 13 14 -1 15 16 17 -1 18 19 20 -1 21 22 23 -1 
24 25 26 -1 27 28 29 -1 30 31 32 -1 33 34 35 -1 
36 37 38 -1 39 40 41 -1 42 43 44 -1 45 46 47 -1 
48 49 50 -1 51 52 53 -1 54 55 56 -1 57 58 59 -1 
60 61 62 -1 63 64 65 -1 66 67 68 -1 69 70 71 -1 
72 73 74 -1 75 76 77 -1 78 79 80 -1 81 82 83 -1 
84 85 86 -1 87 88 89 -1 90 91 92 -1 93 94 95 -1 
96 97 98 -1 99 100 101 -1 102 103 104 -1 105 106 107 -1 
108 109 110 -1 111 112 113 -1 114 115 116 -1 117 118 119 -1 
120 121 122 -1 123 124 125 -1 126 127 128 -1 129 130 131 -1 
132 133 134 -1 135 136 137 -1 138 139 140 -1 141 142 143 -1 
144 145 146 -1 147 148 149 -1 150 151 152 -1 153 154 155 -1 
156 157 158 -1 159 160 161 -1 162 163 164 -1 165 166 167 -1 
168 169 170 -1 171 172 173 -1 174 175 176 -1 177 178 179 -1 
180 181 182 -1 183 184 185 -1 186 187 188 -1 189 190 191 -1 
192 193 194 -1 195 196 197 -1 198 199 200 -1 201 202 203 -1 
204 205 206 -1 207 208 209 -1 210 211 212 -1 213 214 215 -1 
216 217 218 -1 219 220 221 -1 222 223 224 -1 225 226 227 -1 
228 229 230 -1 231 232 233 -1 234 235 236 -1 237 238 239 -1 
240 241 242 -1 243 244 245 -1 246 247 248 -1 249 250 251 -1 
252 253 254 -1 255 256 257 -1 258 259 260 -1 261 262 263 -1 
264 265 266 -1 267 268 269 -1 270 271 272 -1 273 274 275 -1 
276 277 278 -1 279 280 281 -1 282 283 284 -1 285 286 287 -1 
288 289 290 -1 291 292 293 -1 294 295 296 -1 297 298 299 -1 
300 301 302 -1 303 304 305 -1 306 307 308 -1 309 310 311 -1 
312 313 314 -1 315 316 317 -1 318 319 320 -1 321 322 323 -1 
324 325 326 -1 327 328 329 -1 330 331 332 -1 333 334 335 -1 
336 337 338 -1 339 340 341 -1 342 343 344 -1 345 346 347 -1 
348 349 350 -1 351 352 353 -1 354 355 356 -1 357 358 359 -1 
360 361 362 -1 363 364 365 -1 366 367 368 -1 369 370 371 -1 
372 373 374 -1 375 376 377 -1 378 379 380 -1 381 382 383 -1 
384 385 386 -1 387 388 389 -1 390 391 392 -1 393 394 395 -1 
396 397 398 -1 399 400 401 -1 402 403 404 -1 405 406 407 -1 
408 409 410 -1 411 412 413 -1 414 415 416 -1 417 418 419 -1 
420 421 422 -1 423 424 425 -1 426 427 428 -1 429 430 431 -1 
432 433 434 -1 435 436 437 -1 438 439 440 -1 441 442 443 -1 
444 445 446 -1 447 448 449 -1 450 451 452 -1 453 454 455 -1 
456 457 458 -1 459 460 461 -1 462 463 464 -1 465 466 467 -1 
468 469 470 -1 471 472 473 -1 474 475 476 -1 477 478 479 -1 
480 481 482 -1 483 484 485 -1 486 487 488 -1 489 490 491 -1 
492 493 494 -1 495 496 497 -1 498 499 500 -1 501 502 503 -1 
504 505 506 -1 507 508 509 -1 510 511 512 -1 513 514 515 -1 
516 517 518 -1 519 520 521 -1 522 523 524 -1 525 526 527 -1 
528 529 530 -1 531 532 533 -1 534 535 536 -1 537 538 539 -1 
540 541 542 -1 543 544 545 -1 546 547 548 -1 549 550 551 -1 
552 553 554 -1 555 556 557 -1 558 559 560 -1 561 562 563 -1 
564 565 566 -1 567 568 569 -1 570 571 572 -1 573 574 575 -1 
576 577 578 -1 579 580 581 -1 582 583 584 -1 585 586 587 -1 
588 589 590 -1 591 592 593 -1 594 595 596 -1 597 598 599 -1 
600 601 602 -1 603 604 605 -1 606 607 608 -1 609 610 611 -1 
612 613 614 -1 615 616 617 -1 618 619 620 -1 621 622 623 -1 
624 625 626 -1 627 628 629 -1 630 631 632 -1 633 634 635 -1 
636 637 638 -1 639 640 641 -1 642 643 644 -1 645 646 647 -1 
648 649 650 -1 651 652 653 -1 654 655 656 -1 657 658 659 -1 
660 661 662 -1 663 664 665 -1 666 667 668 -1 669 670 671 -1 
672 673 674 -1 675 676 677 -1 678 679 680 -1 681 682 683 -1 
684 685 686 -1 687 688 689 -1 690 691 692 -1 693 694 695 -1 
696 697 698 -1 699 700 701 -1 702 703 704 -1 705 706 707 -1 
708 709 710 -1 711 712 713 -1 714 715 716 -1 717 718 719 -1 
720 721 722 -1 723 724 725 -1 726 727 728 -1 729 730 731 -1 
732 733 734 -1 735 736 737 -1 738 739 740 -1 741 742 743 -1 
744 745 746 -1 747 748 749 -1 750 751 752 -1 753 754 755 -1 
756 757 758 -1 759 760 761 -1 762 763 764 -1 765 766 767 -1 
768 769 770 -1 771 772 773 -1 774 775 776 -1 777 778 779 -1 
780 781 782 -1 783 784 785 -1 786 787 788 -1 789 790 791 -1 
792 793 794 -1 795 796 797 -1 798 799 800 -1 801 802 803 -1 
804 805 806 -1 807 808 809 -1 810 811 812 -1 813 814 815 -1 
816 817 818 -1 819 820 821 -1 822 823 824 -1 825 826 827 -1 
828 829 830 -1 831 832 833 -1 834 835 836 -1 837 838 839 -1 
840 841 842 -1 843 844 845 -1 846 847 848 -1 849 850 851 -1 
852 853 854 -1 855 856 857 -1 858 859 860 -1 861 862 863 -1 
864 865 866 -1 867 868 869 -1 870 871 872 -1 873 874 875 -1 
876 877 878 -1 879 880 881 -1 882 883 884 -1 885 886 887 -1 
888 889 890 -1 891 892 893 -1 894 895 896 -1 897 898 899 -1 
900 901 902 -1 903 904 905 -1 906 907 908 -1 909 910 911 -1 
912 913 914 -1 915 916 917 -1 918 919 920 -1 921 922 923 -1 
924 925 926 -1 927 928 929 -1 930 931 932 -1 933 934 935 -1 
936 937 938 -1 939 940 941 -1 942 943 944 -1 945 946 947 -1 
948 949 950 -1 951 952 953 -1 954 955 956 -1 957 958 959 -1 
960 961 962 -1 963 964 965 -1 966 967 968 -1 969 970 971 -1 
972 973 974 -1 975 976 977 -1 978 979 980 -1 981 982 983 -1 
984 985 986 -1 987 988 989 -1 990 991 992 -1 993 994 995 -1 
996 997 998 -1 999 1000 1001 -1 1002 1003 1004 -1 1005 1006 1007 -1 
1008 1009 1010 -1 1011 1012 1013 -1 1014 1015 1016 -1 1017 1018 1019 -1 
1020 1021 1022 -1 1023 1024 1025 -1 1026 1027 1028 -1 1029 1030 1031 -1 
1032 1033 1034 -1 1035 1036 1037 -1 1038 1039 1040 -1 1041 1042 1043 -1 
1044 1045 1046 -1 1047 1048 1049 -1 1050 1051 1052 -1 1053 1054 1055 -1 
1056 1057 1058 -1 1059 1060 1061 -1 1062 1063 1064 -1 1065 1066 1067 -1 
1068 1069 1070 -1 1071 1072 1073 -1 1074 1075 1076 -1 1077 1078 1079 -1 
1080 1081 1082 -1 1083 1084 1085 -1 1086 1087 1088 -1 1089 1090 1091 -1 
1092 1093 1094 -1 1095 1096 1097 -1 1098 1099 1100 -1 1101 1102 1103 -1 
1104 1105 1106 -1 1107 1108 1109 -1 1110 1111 1112 1113 -1 1114 1115 1116 1117 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -62.5 -32.6 -29.47 -62.55 -32.52 -29.36 -68.52 -32.6 -32.33 -61.61 -33.83 -31.28
 -67.54 -33.83 -34.31 -60.67 -35.05 -33.06 -66.52 -35.05 -36.26 -59.67 -36.28 -34.81
 -65.43 -36.28 -38.18 -58.63 -37.5 -36.53 -64.29 -37.5 -40.06 -57.55 -38.73 -38.23
 -63.1 -38.73 -41.91 -56.41 -39.96 -39.89 -61.86 -39.96 -43.73 -55.23 -41.18 -41.52
 -60.57 -41.18 -45.51 -54 -42.41 -43.11 -59.22 -42.41 -47.26 -52.73 -43.63 -44.67
 -57.83 -43.63 -48.96 -51.41 -44.86 -46.19 -56.39 -44.86 -50.63 -50.05 -46.08 -47.68
 -54.9 -46.08 -52.25 -48.65 -47.31 -49.12 -53.37 -47.31 -53.83 -47.21 -48.54 -50.53
 -51.79 -48.54 -55.37 -45.73 -49.76 -51.89 -50.17 -49.76 -56.86 -44.21 -50.99 -53.21
 -48.51 -50.99 -58.3 -42.65 -52.21 -54.49 -46.81 -52.21 -59.7 -41.06 -53.44 -55.72
 -45.07 -53.44 -61.05 -39.43 -54.66 -56.91 -43.29 -54.66 -62.35 -37.77 -55.89 -58.05
 -41.47 -55.89 -63.6 -36.08 -57.12 -59.14 -39.62 -57.12 -64.79 -34.36 -58.34 -60.19
 -37.74 -58.34 -65.93 -32.61 -59.57 -61.18 -35.83 -59.57 -67.02 -30.84 -60.79 -62.13
 -33.88 -60.79 -68.06 -29.03 -62.02 -63.02 -31.91 -62.02 -69.04 -27.21 -63.24 -63.86
 -29.91 -63.24 -69.96 -25.36 -64.47 -64.65 -27.89 -64.47 -70.82 -23.48 -65.7 -65.39
 -25.84 -65.7 -71.63 -21.59 -66.92 -66.08 -23.77 -66.92 -72.38 -19.68 -68.15 -66.71
 -21.68 -68.15 -73.07 -17.75 -69.37 -67.28 -19.57 -69.37 -73.7 -15.81 -70.6 -67.8
 -17.44 -70.6 -74.27 -13.85 -71.82 -68.27 -15.3 -71.82 -74.78 -11.88 -73.05 -68.68
 -13.14 -73.05 -75.23 -9.89 -74.28 -69.03 -10.97 -74.28 -75.61 -7.9 -75.5 -69.33
 -8.8 -75.5 -75.94 -5.91 -76.73 -69.57 -6.61 -76.73 -76.2 -3.9 -77.95 -69.76
 -4.42 -77.95 -76.4 -1.89 -79.18 -69.88 -2.22 -79.18 -76.54 0.12 -80.41 -69.95
 -0.02 -80.41 -76.62 2.13 -81.63 -69.97 2.18 -81.63 -76.64 4.14 -82.86 -69.92
 4.38 -82.86 -76.59 6.15 -84.08 -69.82 6.58 -84.08 -76.48 8.16 -85.31 -69.67
 8.78 -85.31 -76.3 10.16 -86.53 -69.45 11.01 -87.06 -69.34 10.97 -86.53 -76.07
 11.9 -87.06 -75.95 12.03 -87.68 -69.2 13.01 -87.68 -75.79 12.84 -88.18 -69.07
 13.9 -88.18 -75.66 -67.62 -29.27 -34.16 -66.6 -30.49 -36.1 -65.52 -31.72 -38.02
 -64.39 -32.95 -39.91 -63.2 -34.17 -41.77 -61.96 -35.4 -43.59 -60.67 -36.62 -45.37
 -59.33 -37.85 -47.12 -57.94 -39.07 -48.83 -56.51 -40.3 -50.5 -55.02 -41.53 -52.12
 -53.49 -42.75 -53.71 -51.92 -43.98 -55.25 -50.3 -45.2 -56.74 -48.64 -46.43 -58.19
 -46.95 -47.65 -59.59 -45.21 -48.88 -60.94 -43.43 -50.11 -62.25 -41.62 -51.33 -63.5
 -39.77 -52.56 -64.7 -37.89 -53.78 -65.84 -35.98 -55.01 -66.94 -34.04 -56.23 -67.98
 -32.07 -57.46 -68.96 -30.07 -58.69 -69.89 -28.05 -59.91 -70.76 -26 -61.14 -71.57
 -23.93 -62.36 -72.32 -21.84 -63.59 -73.01 -19.74 -64.81 -73.65 -17.61 -66.04 -74.22
 -15.47 -67.27 -74.74 -13.32 -68.49 -75.19 -11.15 -69.72 -75.58 -8.97 -70.94 -75.92
 -6.79 -72.17 -76.18 -4.59 -73.39 -76.39 -2.4 -74.62 -76.53 -0.2 -75.85 -76.62
 2 -77.07 -76.64 4.21 -78.3 -76.59 6.41 -79.52 -76.49 8.6 -80.75 -76.32
 10.79 -81.97 -76.09 12.97 -83.2 -75.8 13.9 -83.72 -75.66 -60.74 -30.49 -32.92
 -61.68 -29.27 -31.14 -59.76 -31.72 -34.67 -58.72 -32.95 -36.4 -57.63 -34.17 -38.09
 -56.5 -35.4 -39.76 -55.32 -36.62 -41.39 -54.1 -37.85 -42.99 -52.83 -39.07 -44.55
 -51.52 -40.3 -46.07 -50.16 -41.53 -47.56 -48.76 -42.75 -49.01 -47.32 -43.98 -50.42
 -45.85 -45.2 -51.78 -44.33 -46.43 -53.11 -42.78 -47.65 -54.39 -41.19 -48.88 -55.62
 -39.56 -50.11 -56.81 -37.91 -51.33 -57.96 -36.22 -52.56 -59.06 -34.5 -53.78 -60.1
 -32.76 -55.01 -61.1 -30.98 -56.23 -62.05 -29.18 -57.46 -62.95 -27.35 -58.69 -63.8
 -25.5 -59.91 -64.59 -23.63 -61.14 -65.33 -21.74 -62.36 -66.02 -19.83 -63.59 -66.66
 -17.9 -64.81 -67.24 -15.96 -66.04 -67.76 -14 -67.27 -68.23 -12.03 -68.49 -68.65
 -10.05 -69.72 -69.01 -8.06 -70.94 -69.31 -6.07 -72.17 -69.56 -4.06 -73.39 -69.74
 -2.05 -74.62 -69.88 -0.04 -75.85 -69.95 1.97 -77.07 -69.97 3.98 -78.3 -69.93
 5.99 -79.52 -69.83 8 -80.75 -69.68 10 -81.97 -69.47 12 -83.2 -69.2
 12.84 -83.72 -69.07"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0.08 0 0.08 0 -0.09 0.05 0.08 0.01 0.08 0 -0.09 0.05 -0.09 0.05 0.08 0 -0.09 0.09 0.08 0.05 0.08 0.05 -0.09 
0.09 -0.09 0.09 0.08 0.05 -0.09 0.13 0.08 0.09 0.08 0.09 -0.09 0.13 -0.09 0.13 0.08 0.09 -0.09 0.17 0.08 0.13 0.08 0.13 -0.09 
0.17 -0.09 0.17 0.08 0.13 -0.09 0.21 0.08 0.17 0.08 0.17 -0.09 0.21 -0.09 0.21 0.08 0.17 -0.09 0.26 0.08 0.22 0.08 0.21 -0.09 
0.26 -0.09 0.26 0.08 0.21 -0.09 0.3 0.08 0.26 0.08 0.26 -0.09 0.3 -0.09 0.3 0.08 0.26 -0.09 0.34 0.08 0.3 0.08 0.3 -0.09 
0.34 -0.09 0.34 0.08 0.3 -0.09 0.38 0.08 0.34 0.08 0.34 -0.09 0.38 -0.09 0.38 0.08 0.34 -0.09 0.42 0.08 0.38 0.08 0.38 -0.09 
0.42 -0.09 0.42 0.08 0.38 -0.09 0.47 0.08 0.43 0.08 0.42 -0.09 0.47 -0.09 0.47 0.08 0.42 -0.09 0.51 0.08 0.47 0.08 0.47 -0.09 
0.51 -0.09 0.51 0.08 0.47 -0.09 0.55 0.08 0.51 0.08 0.51 -0.09 0.55 -0.09 0.55 0.08 0.51 -0.09 0.59 0.08 0.55 0.08 0.55 -0.09 
0.59 -0.09 0.59 0.08 0.55 -0.09 0.63 0.08 0.59 0.08 0.59 -0.09 0.63 -0.09 0.63 0.08 0.59 -0.09 0.68 0.08 0.64 0.08 0.63 -0.09 
0.68 -0.09 0.68 0.08 0.63 -0.09 0.72 0.08 0.68 0.08 0.68 -0.09 0.72 -0.09 0.72 0.08 0.68 -0.09 0.76 0.08 0.72 0.08 0.72 -0.09 
0.76 -0.09 0.76 0.08 0.72 -0.09 0.8 0.08 0.76 0.08 0.76 -0.09 0.8 -0.09 0.8 0.08 0.76 -0.09 0.84 0.08 0.8 0.08 0.8 -0.09 
0.84 -0.09 0.84 0.08 0.8 -0.09 0.89 0.08 0.85 0.08 0.84 -0.09 0.89 -0.09 0.89 0.08 0.84 -0.09 0.93 0.08 0.89 0.08 0.89 -0.09 
0.93 -0.09 0.93 0.08 0.89 -0.09 0.97 0.08 0.93 0.08 0.93 -0.09 0.97 -0.09 0.97 0.08 0.93 -0.09 1.01 0.08 0.97 0.08 0.97 -0.09 
1.01 -0.09 1.01 0.08 0.97 -0.09 1.05 0.08 1.01 0.08 1.01 -0.09 1.06 -0.09 1.05 0.08 1.01 -0.09 1.1 0.08 1.06 0.08 1.06 -0.09 
1.1 -0.09 1.1 0.08 1.06 -0.09 1.14 0.08 1.1 0.08 1.1 -0.09 1.14 -0.09 1.14 0.08 1.1 -0.09 1.18 0.08 1.14 0.08 1.14 -0.09 
1.18 -0.09 1.18 0.08 1.14 -0.09 1.22 0.08 1.18 0.08 1.18 -0.09 1.22 -0.09 1.22 0.08 1.18 -0.09 1.26 0.08 1.22 0.08 1.22 -0.09 
1.27 -0.09 1.26 0.08 1.22 -0.09 1.31 0.08 1.27 0.08 1.27 -0.09 1.31 -0.09 1.31 0.08 1.27 -0.09 1.35 0.08 1.31 0.08 1.31 -0.09 
1.35 -0.09 1.35 0.08 1.31 -0.09 1.39 0.08 1.35 0.08 1.35 -0.09 1.39 -0.09 1.39 0.08 1.35 -0.09 1.43 0.08 1.39 0.08 1.39 -0.09 
1.43 -0.09 1.43 0.08 1.39 -0.09 1.47 0.08 1.43 0.08 1.43 -0.09 1.48 -0.09 1.47 0.08 1.43 -0.09 1.52 0.08 1.48 0.08 1.48 -0.09 
1.52 -0.09 1.52 0.08 1.48 -0.09 1.56 0.08 1.52 0.08 1.52 -0.09 1.56 -0.09 1.56 0.08 1.52 -0.09 1.6 0.08 1.56 0.08 1.56 -0.09 
1.6 -0.09 1.6 0.08 1.56 -0.09 1.64 0.08 1.6 0.08 1.6 -0.09 1.64 -0.09 1.64 0.08 1.6 -0.09 1.68 0.08 1.64 0.08 1.64 -0.09 
1.69 -0.09 1.68 0.08 1.64 -0.09 1.73 0.08 1.69 0.08 1.69 -0.09 1.73 -0.09 1.73 0.08 1.69 -0.09 1.77 0.08 1.73 0.08 1.73 -0.09 
1.77 -0.09 1.77 0.08 1.73 -0.09 1.81 0.08 1.77 0.08 1.77 -0.09 1.81 -0.09 1.81 0.08 1.77 -0.09 1.85 0.08 1.81 0.08 1.81 -0.09 
1.87 0.07 1.85 0.07 1.81 -0.09 1.85 -0.09 1.87 0.08 1.81 -0.09 1.87 -0.09 1.87 0.08 1.85 -0.09 1.89 0.08 1.87 0.08 1.87 -0.09 
1.89 -0.09 1.89 0.08 1.87 -0.09 1.91 0.08 1.89 0.08 1.89 -0.09 1.91 -0.09 1.91 0.08 1.89 -0.09 0.04 -0.16 0 -0.16 0 -0.26 
0.05 -0.26 0.04 -0.16 0 -0.26 0.09 -0.16 0.04 -0.16 0.05 -0.26 0.09 -0.26 0.09 -0.16 0.05 -0.26 0.13 -0.16 0.09 -0.16 0.09 -0.26 
0.13 -0.26 0.13 -0.16 0.09 -0.26 0.17 -0.16 0.13 -0.16 0.13 -0.26 0.17 -0.26 0.17 -0.16 0.13 -0.26 0.21 -0.16 0.17 -0.16 0.17 -0.26 
0.21 -0.26 0.21 -0.16 0.17 -0.26 0.25 -0.16 0.21 -0.16 0.21 -0.26 0.26 -0.26 0.25 -0.16 0.21 -0.26 0.3 -0.16 0.25 -0.16 0.26 -0.26 
0.3 -0.26 0.3 -0.16 0.26 -0.26 0.34 -0.16 0.3 -0.16 0.3 -0.26 0.34 -0.26 0.34 -0.16 0.3 -0.26 0.38 -0.16 0.34 -0.16 0.34 -0.26 
0.38 -0.26 0.38 -0.16 0.34 -0.26 0.42 -0.16 0.38 -0.16 0.38 -0.26 0.42 -0.26 0.42 -0.16 0.38 -0.26 0.46 -0.16 0.42 -0.16 0.42 -0.26 
0.47 -0.26 0.46 -0.16 0.42 -0.26 0.51 -0.16 0.46 -0.16 0.47 -0.26 0.51 -0.26 0.51 -0.16 0.47 -0.26 0.55 -0.16 0.51 -0.16 0.51 -0.26 
0.55 -0.26 0.55 -0.16 0.51 -0.26 0.59 -0.16 0.55 -0.16 0.55 -0.26 0.59 -0.26 0.59 -0.16 0.55 -0.26 0.63 -0.16 0.59 -0.16 0.59 -0.26 
0.63 -0.26 0.63 -0.16 0.59 -0.26 0.67 -0.16 0.63 -0.16 0.63 -0.26 0.68 -0.26 0.67 -0.16 0.63 -0.26 0.72 -0.16 0.67 -0.16 0.68 -0.26 
0.72 -0.26 0.72 -0.16 0.68 -0.26 0.76 -0.16 0.72 -0.16 0.72 -0.26 0.76 -0.26 0.76 -0.16 0.72 -0.26 0.8 -0.16 0.76 -0.16 0.76 -0.26 
0.8 -0.26 0.8 -0.16 0.76 -0.26 0.84 -0.16 0.8 -0.16 0.8 -0.26 0.84 -0.26 0.84 -0.16 0.8 -0.26 0.88 -0.16 0.84 -0.16 0.84 -0.26 
0.89 -0.26 0.88 -0.16 0.84 -0.26 0.93 -0.16 0.88 -0.16 0.89 -0.26 0.93 -0.26 0.93 -0.16 0.89 -0.26 0.97 -0.16 0.93 -0.16 0.93 -0.26 
0.97 -0.26 0.97 -0.16 0.93 -0.26 1.01 -0.16 0.97 -0.16 0.97 -0.26 1.01 -0.26 1.01 -0.16 0.97 -0.26 1.05 -0.16 1.01 -0.16 1.01 -0.26 
1.05 -0.26 1.05 -0.16 1.01 -0.26 1.09 -0.16 1.05 -0.16 1.05 -0.26 1.1 -0.26 1.09 -0.16 1.05 -0.26 1.14 -0.16 1.09 -0.16 1.1 -0.26 
1.14 -0.26 1.14 -0.16 1.1 -0.26 1.18 -0.16 1.14 -0.16 1.14 -0.26 1.18 -0.26 1.18 -0.16 1.14 -0.26 1.22 -0.16 1.18 -0.16 1.18 -0.26 
1.22 -0.26 1.22 -0.16 1.18 -0.26 1.26 -0.16 1.22 -0.16 1.22 -0.26 1.26 -0.26 1.26 -0.16 1.22 -0.26 1.3 -0.16 1.26 -0.16 1.26 -0.26 
1.31 -0.26 1.3 -0.16 1.26 -0.26 1.35 -0.16 1.3 -0.16 1.31 -0.26 1.35 -0.26 1.35 -0.16 1.31 -0.26 1.39 -0.16 1.35 -0.16 1.35 -0.26 
1.39 -0.26 1.39 -0.16 1.35 -0.26 1.43 -0.16 1.39 -0.16 1.39 -0.26 1.43 -0.26 1.43 -0.16 1.39 -0.26 1.47 -0.16 1.43 -0.16 1.43 -0.26 
1.47 -0.26 1.47 -0.16 1.43 -0.26 1.51 -0.16 1.47 -0.16 1.47 -0.26 1.52 -0.26 1.51 -0.16 1.47 -0.26 1.56 -0.16 1.51 -0.16 1.52 -0.26 
1.56 -0.26 1.56 -0.16 1.52 -0.26 1.6 -0.16 1.56 -0.16 1.56 -0.26 1.6 -0.26 1.6 -0.16 1.56 -0.26 1.64 -0.16 1.6 -0.16 1.6 -0.26 
1.64 -0.26 1.64 -0.16 1.6 -0.26 1.68 -0.16 1.64 -0.16 1.64 -0.26 1.68 -0.26 1.68 -0.16 1.64 -0.26 1.72 -0.16 1.68 -0.16 1.68 -0.26 
1.73 -0.26 1.72 -0.16 1.68 -0.26 1.77 -0.16 1.72 -0.16 1.73 -0.26 1.77 -0.26 1.77 -0.16 1.73 -0.26 1.81 -0.16 1.77 -0.16 1.77 -0.26 
1.81 -0.26 1.81 -0.16 1.77 -0.26 1.85 -0.16 1.81 -0.16 1.81 -0.26 1.87 -0.16 1.85 -0.16 1.81 -0.26 1.85 -0.26 1.87 -0.16 1.81 -0.26 
1.87 -0.26 1.87 -0.16 1.85 -0.26 1.89 -0.16 1.87 -0.16 1.87 -0.26 1.91 -0.16 1.89 -0.16 1.87 -0.26 0.04 -0.36 0 -0.19 0 -0.36 
0.05 -0.19 0 -0.19 0.04 -0.36 0.08 -0.36 0.04 -0.19 0.04 -0.36 0.08 -0.19 0.04 -0.19 0.08 -0.36 0.12 -0.36 0.08 -0.19 0.08 -0.36 
0.12 -0.19 0.08 -0.19 0.12 -0.36 0.16 -0.36 0.12 -0.19 0.12 -0.36 0.16 -0.19 0.12 -0.19 0.16 -0.36 0.2 -0.36 0.16 -0.19 0.16 -0.36 
0.2 -0.19 0.16 -0.19 0.2 -0.36 0.24 -0.36 0.2 -0.19 0.2 -0.36 0.24 -0.19 0.2 -0.19 0.24 -0.36 0.28 -0.36 0.24 -0.19 0.24 -0.36 
0.28 -0.19 0.24 -0.19 0.28 -0.36 0.32 -0.36 0.28 -0.19 0.28 -0.36 0.32 -0.19 0.28 -0.19 0.32 -0.36 0.36 -0.36 0.32 -0.19 0.32 -0.36 
0.36 -0.19 0.32 -0.19 0.36 -0.36 0.4 -0.36 0.36 -0.19 0.36 -0.36 0.4 -0.19 0.36 -0.19 0.4 -0.36 0.44 -0.36 0.4 -0.19 0.4 -0.36 
0.44 -0.19 0.4 -0.19 0.44 -0.36 0.48 -0.36 0.44 -0.19 0.44 -0.36 0.48 -0.19 0.44 -0.19 0.48 -0.36 0.52 -0.36 0.47 -0.19 0.48 -0.36 
0.52 -0.19 0.47 -0.19 0.52 -0.36 0.55 -0.36 0.51 -0.19 0.52 -0.36 0.56 -0.19 0.51 -0.19 0.55 -0.36 0.59 -0.36 0.55 -0.19 0.55 -0.36 
0.6 -0.19 0.55 -0.19 0.59 -0.36 0.63 -0.36 0.59 -0.19 0.59 -0.36 0.63 -0.19 0.59 -0.19 0.63 -0.36 0.67 -0.36 0.63 -0.19 0.63 -0.36 
0.67 -0.19 0.63 -0.19 0.67 -0.36 0.71 -0.36 0.67 -0.19 0.67 -0.36 0.71 -0.19 0.67 -0.19 0.71 -0.36 0.75 -0.36 0.71 -0.19 0.71 -0.36 
0.75 -0.19 0.71 -0.19 0.75 -0.36 0.79 -0.36 0.75 -0.19 0.75 -0.36 0.79 -0.19 0.75 -0.19 0.79 -0.36 0.83 -0.36 0.79 -0.19 0.79 -0.36 
0.83 -0.19 0.79 -0.19 0.83 -0.36 0.87 -0.36 0.83 -0.19 0.83 -0.36 0.87 -0.19 0.83 -0.19 0.87 -0.36 0.91 -0.36 0.87 -0.19 0.87 -0.36 
0.91 -0.19 0.87 -0.19 0.91 -0.36 0.95 -0.36 0.91 -0.19 0.91 -0.36 0.95 -0.19 0.91 -0.19 0.95 -0.36 0.99 -0.36 0.95 -0.19 0.95 -0.36 
0.99 -0.19 0.95 -0.19 0.99 -0.36 1.03 -0.36 0.99 -0.19 0.99 -0.36 1.03 -0.19 0.99 -0.19 1.03 -0.36 1.07 -0.36 1.02 -0.19 1.03 -0.36 
1.07 -0.19 1.02 -0.19 1.07 -0.36 1.1 -0.36 1.06 -0.19 1.07 -0.36 1.11 -0.19 1.06 -0.19 1.1 -0.36 1.14 -0.36 1.1 -0.19 1.1 -0.36 
1.15 -0.19 1.1 -0.19 1.14 -0.36 1.18 -0.36 1.14 -0.19 1.14 -0.36 1.18 -0.19 1.14 -0.19 1.18 -0.36 1.22 -0.36 1.18 -0.19 1.18 -0.36 
1.22 -0.19 1.18 -0.19 1.22 -0.36 1.26 -0.36 1.22 -0.19 1.22 -0.36 1.26 -0.19 1.22 -0.19 1.26 -0.36 1.3 -0.36 1.26 -0.19 1.26 -0.36 
1.3 -0.19 1.26 -0.19 1.3 -0.36 1.34 -0.36 1.3 -0.19 1.3 -0.36 1.34 -0.19 1.3 -0.19 1.34 -0.36 1.38 -0.36 1.34 -0.19 1.34 -0.36 
1.38 -0.19 1.34 -0.19 1.38 -0.36 1.42 -0.36 1.38 -0.19 1.38 -0.36 1.42 -0.19 1.38 -0.19 1.42 -0.36 1.46 -0.36 1.42 -0.19 1.42 -0.36 
1.46 -0.19 1.42 -0.19 1.46 -0.36 1.5 -0.36 1.46 -0.19 1.46 -0.36 1.5 -0.19 1.46 -0.19 1.5 -0.36 1.54 -0.36 1.5 -0.19 1.5 -0.36 
1.54 -0.19 1.5 -0.19 1.54 -0.36 1.58 -0.36 1.54 -0.19 1.54 -0.36 1.58 -0.19 1.54 -0.19 1.58 -0.36 1.62 -0.36 1.57 -0.19 1.58 -0.36 
1.62 -0.19 1.57 -0.19 1.62 -0.36 1.65 -0.36 1.61 -0.19 1.62 -0.36 1.66 -0.19 1.61 -0.19 1.65 -0.36 1.69 -0.36 1.65 -0.19 1.65 -0.36 
1.7 -0.19 1.65 -0.19 1.69 -0.36 1.73 -0.36 1.69 -0.19 1.69 -0.36 1.75 -0.36 1.69 -0.19 1.73 -0.36 1.73 -0.19 1.69 -0.19 1.75 -0.36 
1.75 -0.19 1.73 -0.19 1.75 -0.36 0.01 -0.53 0 -0.43 0 -0.53 0.04 -0.43 0 -0.43 0.01 -0.53 0.05 -0.53 0.04 -0.43 0.01 -0.53 
0.08 -0.43 0.04 -0.43 0.05 -0.53 0.09 -0.53 0.08 -0.43 0.05 -0.53 0.12 -0.43 0.08 -0.43 0.09 -0.53 0.13 -0.53 0.12 -0.43 0.09 -0.53 
0.16 -0.43 0.12 -0.43 0.13 -0.53 0.16 -0.53 0.16 -0.43 0.13 -0.53 0.2 -0.43 0.16 -0.43 0.16 -0.53 0.2 -0.53 0.2 -0.43 0.16 -0.53 
0.24 -0.43 0.2 -0.43 0.2 -0.53 0.24 -0.53 0.24 -0.43 0.2 -0.53 0.28 -0.43 0.24 -0.43 0.24 -0.53 0.28 -0.53 0.28 -0.43 0.24 -0.53 
0.32 -0.43 0.28 -0.43 0.28 -0.53 0.32 -0.53 0.32 -0.43 0.28 -0.53 0.36 -0.43 0.32 -0.43 0.32 -0.53 0.36 -0.53 0.36 -0.43 0.32 -0.53 
0.4 -0.43 0.36 -0.43 0.36 -0.53 0.4 -0.53 0.4 -0.43 0.36 -0.53 0.44 -0.43 0.4 -0.43 0.4 -0.53 0.44 -0.53 0.44 -0.43 0.4 -0.53 
0.48 -0.43 0.44 -0.43 0.44 -0.53 0.48 -0.53 0.48 -0.43 0.44 -0.53 0.52 -0.43 0.48 -0.43 0.48 -0.53 0.52 -0.53 0.52 -0.43 0.48 -0.53 
0.55 -0.43 0.52 -0.43 0.52 -0.53 0.56 -0.53 0.55 -0.43 0.52 -0.53 0.59 -0.43 0.55 -0.43 0.56 -0.53 0.6 -0.53 0.59 -0.43 0.56 -0.53 
0.63 -0.43 0.59 -0.43 0.6 -0.53 0.64 -0.53 0.63 -0.43 0.6 -0.53 0.67 -0.43 0.63 -0.43 0.64 -0.53 0.68 -0.53 0.67 -0.43 0.64 -0.53 
0.71 -0.43 0.67 -0.43 0.68 -0.53 0.71 -0.53 0.71 -0.43 0.68 -0.53 0.75 -0.43 0.71 -0.43 0.71 -0.53 0.75 -0.53 0.75 -0.43 0.71 -0.53 
0.79 -0.43 0.75 -0.43 0.75 -0.53 0.79 -0.53 0.79 -0.43 0.75 -0.53 0.83 -0.43 0.79 -0.43 0.79 -0.53 0.83 -0.53 0.83 -0.43 0.79 -0.53 
0.87 -0.43 0.83 -0.43 0.83 -0.53 0.87 -0.53 0.87 -0.43 0.83 -0.53 0.91 -0.43 0.87 -0.43 0.87 -0.53 0.91 -0.53 0.91 -0.43 0.87 -0.53 
0.95 -0.43 0.91 -0.43 0.91 -0.53 0.95 -0.53 0.95 -0.43 0.91 -0.53 0.99 -0.43 0.95 -0.43 0.95 -0.53 0.99 -0.53 0.99 -0.43 0.95 -0.53 
1.03 -0.43 0.99 -0.43 0.99 -0.53 1.03 -0.53 1.03 -0.43 0.99 -0.53 1.07 -0.43 1.03 -0.43 1.03 -0.53 1.07 -0.53 1.07 -0.43 1.03 -0.53 
1.1 -0.43 1.07 -0.43 1.07 -0.53 1.11 -0.53 1.1 -0.43 1.07 -0.53 1.14 -0.43 1.1 -0.43 1.11 -0.53 1.15 -0.53 1.14 -0.43 1.11 -0.53 
1.18 -0.43 1.14 -0.43 1.15 -0.53 1.19 -0.53 1.18 -0.43 1.15 -0.53 1.22 -0.43 1.18 -0.43 1.19 -0.53 1.23 -0.53 1.22 -0.43 1.19 -0.53 
1.26 -0.43 1.22 -0.43 1.23 -0.53 1.26 -0.53 1.26 -0.43 1.23 -0.53 1.3 -0.43 1.26 -0.43 1.26 -0.53 1.3 -0.53 1.3 -0.43 1.26 -0.53 
1.34 -0.43 1.3 -0.43 1.3 -0.53 1.34 -0.53 1.34 -0.43 1.3 -0.53 1.38 -0.43 1.34 -0.43 1.34 -0.53 1.38 -0.53 1.38 -0.43 1.34 -0.53 
1.42 -0.43 1.38 -0.43 1.38 -0.53 1.42 -0.53 1.42 -0.43 1.38 -0.53 1.46 -0.43 1.42 -0.43 1.42 -0.53 1.46 -0.53 1.46 -0.43 1.42 -0.53 
1.5 -0.43 1.46 -0.43 1.46 -0.53 1.5 -0.53 1.5 -0.43 1.46 -0.53 1.54 -0.43 1.5 -0.43 1.5 -0.53 1.54 -0.53 1.54 -0.43 1.5 -0.53 
1.58 -0.43 1.54 -0.43 1.54 -0.53 1.58 -0.53 1.58 -0.43 1.54 -0.53 1.62 -0.43 1.58 -0.43 1.58 -0.53 1.62 -0.53 1.62 -0.43 1.58 -0.53 
1.65 -0.43 1.62 -0.43 1.62 -0.53 1.66 -0.53 1.65 -0.43 1.62 -0.53 1.69 -0.43 1.65 -0.43 1.66 -0.53 1.7 -0.53 1.69 -0.43 1.66 -0.53 
1.73 -0.43 1.69 -0.43 1.7 -0.53 1.75 -0.43 1.73 -0.43 1.7 -0.53 1.74 -0.53 1.75 -0.43 1.7 -0.53 1.75 -0.53 1.75 -0.43 1.74 -0.53 
1.77 -0.53 1.75 -0.43 1.75 -0.53 1.79 -0.53 1.75 -0.43 1.77 -0.53 0.12 0 0 0 0 -0.09 0.12 -0.09 0.08 0 0 0 0 -0.16 0.08 -0.16
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="postTex"></texture>
                    <material is="x3d" use="postMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1 4 5 6 7 -1 7 6 1 0 -1 6 5 2 1 -1 
5 4 3 2 -1 4 7 0 3 -1
"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 20.37 -194.65 -67.86 21.58 -194.65 -75.39 21.58 -71.02 -75.39 20.37 -71.02 -67.86
 12.84 -71.02 -69.07 14.05 -71.02 -76.6 14.05 -194.65 -76.6 12.84 -194.65 -69.07
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="-0.19 0.08 -0.19 -0.11 1.87 -0.11 1.87 0.08 1.87 -0.07 1.87 0.12 -0.19 0.12 -0.19 -0.07 0 -0.19 0.13 -0.19 0.13 0 0 0 0 -0.19 2.07 -0.19 2.07 0 0 0 
0 -0.19 0.13 -0.19 0.13 0 0 0 0 -0.19 2.07 -0.19 2.07 0 0 0"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 2.47 189.71 -73.3 2.61 189.62 -72.81 2.64 189.62 -73.78 3.02 189.37 -72.51
 3.06 189.37 -74.08 3.53 189.06 -72.49 3.57 189.06 -74.06 3.95 188.8 -72.78
 3.97 188.8 -73.75 4.12 188.71 -73.27 4.12 106.34 -73.27 3.95 106.34 -72.78
 3.97 106.34 -73.75 3.53 106.34 -72.49 3.57 106.34 -74.06 3.02 106.34 -72.51
 3.06 106.34 -74.08 2.61 106.34 -72.81 2.64 106.34 -73.78 2.47 106.34 -73.3
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.28 0 0.29 -1.38 0.29 -1.38 0.28 0 0.29 0 0.31 -1.38 0.31 -1.38 0.29 
0 0.31 0 0.32 -1.37 0.32 -1.38 0.31 0 0.32 0 0.33 -1.37 0.33 -1.37 0.32 0 0.33 0 0.34 -1.37 0.34 -1.37 0.33 0 0.34 0 0.36 -1.37 0.36 -1.37 0.34 
0 0.36 0 0.37 -1.37 0.37 -1.37 0.36 0 0.37 0 0.38 -1.38 0.38 -1.37 0.37 0 0.38 0 0.39 -1.38 0.39 -1.38 0.38 0 0.39 0 0.41 -1.38 0.41 -1.38 0.39
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 13.64 183.18 -72.32 13.72 183.09 -71.82 13.88 183.09 -72.77 14.07 182.84 -71.45
 14.34 182.84 -73 14.57 182.52 -71.36 14.85 182.52 -72.91 15.03 182.27 -71.59
 15.2 182.27 -72.54 15.27 182.18 -72.04 15.27 -170.08 -72.04 15.03 -170.08 -71.59
 15.2 -170.08 -72.54 14.57 -170.08 -71.36 14.85 -170.08 -72.91 14.07 -170.08 -71.45
 14.34 -170.08 -73 13.72 -170.08 -71.82 13.88 -170.08 -72.77 13.64 -170.08 -72.32
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.46 0 0.48 -5.88 0.48 -5.88 0.46 0 0.48 0 0.49 -5.88 0.49 -5.88 0.48 
0 0.49 0 0.5 -5.87 0.5 -5.88 0.49 0 0.5 0 0.51 -5.87 0.51 -5.87 0.5 0 0.51 0 0.53 -5.87 0.53 -5.87 0.51 0 0.53 0 0.54 -5.87 0.54 -5.87 0.53 
0 0.54 0 0.55 -5.87 0.55 -5.87 0.54 0 0.55 0 0.56 -5.88 0.56 -5.87 0.55 0 0.56 0 0.58 -5.88 0.58 -5.88 0.56 0 0.58 0 0.59 -5.88 0.59 -5.88 0.58
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 24.55 176.65 -69.67 24.54 176.55 -69.16 24.85 176.55 -70.08 24.84 176.3 -68.75
 25.34 176.3 -70.23 25.32 175.99 -68.58 25.82 175.99 -70.07 25.81 175.74 -68.74
 26.12 175.74 -69.66 26.11 175.64 -69.15 26.11 79.23 -69.15 25.81 79.23 -68.74
 26.12 79.23 -69.66 25.32 79.23 -68.58 25.82 79.23 -70.07 24.84 79.23 -68.75
 25.34 79.23 -70.23 24.54 79.23 -69.16 24.85 79.23 -70.08 24.55 79.23 -69.67
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.03 0 0.04 -1.62 0.04 -1.62 0.03 0 0.04 0 0.06 -1.61 0.06 -1.62 0.04 
0 0.06 0 0.07 -1.61 0.07 -1.61 0.06 0 0.07 0 0.08 -1.6 0.08 -1.61 0.07 0 0.08 0 0.1 -1.6 0.1 -1.6 0.08 0 0.1 0 0.11 -1.6 0.11 -1.6 0.1 
0 0.11 0 0.12 -1.61 0.12 -1.6 0.11 0 0.12 0 0.13 -1.61 0.13 -1.61 0.12 0 0.13 0 0.15 -1.62 0.15 -1.61 0.13 0 0.15 0 0.16 -1.62 0.16 -1.62 0.15
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 34.93 170.12 -65.41 34.85 170.02 -64.91 35.29 170.02 -65.77 35.08 169.77 -64.45
 35.8 169.77 -65.85 35.53 169.46 -64.22 36.25 169.46 -65.61 36.03 169.21 -64.29
 36.48 169.21 -65.16 36.4 169.11 -64.65 36.4 79.23 -64.65 36.03 79.23 -64.29
 36.48 79.23 -65.16 35.53 79.23 -64.22 36.25 79.23 -65.61 35.08 79.23 -64.45
 35.8 79.23 -65.85 34.85 79.23 -64.91 35.29 79.23 -65.77 34.93 79.23 -65.41
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.17 0 0.18 -1.51 0.18 -1.51 0.17 0 0.18 0 0.2 -1.5 0.2 -1.51 0.18 
0 0.2 0 0.21 -1.5 0.21 -1.5 0.2 0 0.21 0 0.22 -1.49 0.22 -1.5 0.21 0 0.22 0 0.23 -1.49 0.23 -1.49 0.22 0 0.23 0 0.25 -1.49 0.25 -1.49 0.23 
0 0.25 0 0.26 -1.5 0.26 -1.49 0.25 0 0.26 0 0.27 -1.5 0.27 -1.5 0.26 0 0.27 0 0.29 -1.51 0.29 -1.5 0.27 0 0.29 0 0.3 -1.51 0.3 -1.51 0.29
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 44.54 163.59 -59.64 44.39 163.49 -59.15 44.96 163.49 -59.94 44.54 163.24 -58.67
 45.47 163.24 -59.94 44.96 162.93 -58.37 45.88 162.93 -59.64 45.47 162.68 -58.37
 46.04 162.68 -59.15 45.88 162.58 -58.67 45.88 79.23 -58.67 45.47 79.23 -58.37
 46.04 79.23 -59.15 44.96 79.23 -58.37 45.88 79.23 -59.64 44.54 79.23 -58.67
 45.47 79.23 -59.94 44.39 79.23 -59.15 44.96 79.23 -59.94 44.54 79.23 -59.64
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 1.23 0 1.25 -1.4 1.25 -1.4 1.23 0 1.25 0 1.26 -1.4 1.26 -1.4 1.25 
0 1.26 0 1.27 -1.39 1.27 -1.4 1.26 0 1.27 0 1.28 -1.39 1.28 -1.39 1.27 0 1.28 0 1.3 -1.38 1.3 -1.39 1.28 0 1.3 0 1.31 -1.39 1.31 -1.38 1.3 
0 1.31 0 1.32 -1.39 1.32 -1.39 1.31 0 1.32 0 1.34 -1.4 1.34 -1.39 1.32 0 1.34 0 1.35 -1.4 1.35 -1.4 1.34 0 1.35 0 1.36 -1.4 1.36 -1.4 1.35
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 52.1 157.92 -53.5 51.88 157.83 -53.04 52.55 157.83 -53.74 51.98 157.57 -52.54
 53.06 157.57 -53.68 52.35 157.26 -52.19 53.43 157.26 -53.32 52.85 157.01 -52.12
 53.52 157.01 -52.82 53.3 156.92 -52.36 53.3 56.56 -52.36 52.85 56.56 -52.12
 53.52 56.56 -52.82 52.35 56.56 -52.19 53.43 56.56 -53.32 51.98 56.56 -52.54
 53.06 56.56 -53.68 51.88 56.56 -53.04 52.55 56.56 -53.74 52.1 56.56 -53.5
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.16 0 0.18 -1.68 0.18 -1.68 0.16 0 0.18 0 0.19 -1.68 0.19 -1.68 0.18 
0 0.19 0 0.2 -1.67 0.2 -1.68 0.19 0 0.2 0 0.21 -1.67 0.21 -1.67 0.2 0 0.21 0 0.23 -1.67 0.23 -1.67 0.21 0 0.23 0 0.24 -1.67 0.24 -1.67 0.23 
0 0.24 0 0.25 -1.67 0.25 -1.67 0.24 0 0.25 0 0.26 -1.68 0.26 -1.67 0.25 0 0.26 0 0.28 -1.68 0.28 -1.68 0.26 0 0.28 0 0.29 -1.68 0.29 -1.68 0.28
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 58.8 152.25 -46.42 58.52 152.16 -46 59.27 152.16 -46.61 58.55 151.91 -45.49
 59.77 151.91 -46.47 58.87 151.6 -45.09 60.09 151.6 -46.08 59.36 151.34 -44.96
 60.11 151.34 -45.57 59.84 151.25 -45.14 59.84 56.56 -45.14 59.36 56.56 -44.96
 60.11 56.56 -45.57 58.87 56.56 -45.09 60.09 56.56 -46.08 58.55 56.56 -45.49
 59.77 56.56 -46.47 58.52 56.56 -46 59.27 56.56 -46.61 58.8 56.56 -46.42
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.47 0 0.49 -1.59 0.49 -1.59 0.47 0 0.49 0 0.5 -1.58 0.5 -1.59 0.49 
0 0.5 0 0.51 -1.58 0.51 -1.58 0.5 0 0.51 0 0.52 -1.57 0.52 -1.58 0.51 0 0.52 0 0.54 -1.57 0.54 -1.57 0.52 0 0.54 0 0.55 -1.57 0.55 -1.57 0.54 
0 0.55 0 0.56 -1.58 0.56 -1.57 0.55 0 0.56 0 0.58 -1.58 0.58 -1.58 0.56 0 0.58 0 0.59 -1.59 0.59 -1.58 0.58 0 0.59 0 0.6 -1.59 0.6 -1.59 0.59
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 64.51 146.59 -38.53 64.18 146.49 -38.15 65 146.49 -38.65 64.14 146.24 -37.64
 65.47 146.24 -38.46 64.4 145.93 -37.2 65.74 145.93 -38.02 64.87 145.68 -37.01
 65.7 145.68 -37.51 65.37 145.58 -37.13 65.37 56.56 -37.13 64.87 56.56 -37.01
 65.7 56.56 -37.51 64.4 56.56 -37.2 65.74 56.56 -38.02 64.14 56.56 -37.64
 65.47 56.56 -38.46 64.18 56.56 -38.15 65 56.56 -38.65 64.51 56.56 -38.53
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 1.04 0 1.05 -1.49 1.05 -1.5 1.04 0 1.05 0 1.06 -1.49 1.06 -1.49 1.05 
0 1.06 0 1.08 -1.48 1.08 -1.49 1.06 0 1.08 0 1.09 -1.48 1.09 -1.48 1.08 0 1.09 0 1.1 -1.48 1.1 -1.48 1.09 0 1.1 0 1.11 -1.48 1.11 -1.48 1.1 
0 1.11 0 1.13 -1.48 1.13 -1.48 1.11 0 1.13 0 1.14 -1.49 1.14 -1.48 1.13 0 1.14 0 1.15 -1.49 1.15 -1.49 1.14 0 1.15 0 1.17 -1.5 1.17 -1.49 1.15
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 69.13 140.92 -29.98 68.75 140.83 -29.64 69.64 140.83 -30.03 68.65 140.58 -29.14
 70.08 140.58 -29.77 68.85 140.27 -28.67 70.29 140.27 -29.31 69.3 140.02 -28.41
 70.18 140.02 -28.81 69.8 139.92 -28.47 69.8 56.56 -28.47 69.3 56.56 -28.41
 70.18 56.56 -28.81 68.85 56.56 -28.67 70.29 56.56 -29.31 68.65 56.56 -29.14
 70.08 56.56 -29.77 68.75 56.56 -29.64 69.64 56.56 -30.03 69.13 56.56 -29.98
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.87 0 0.89 -1.4 0.89 -1.4 0.87 0 0.89 0 0.9 -1.4 0.9 -1.4 0.89 
0 0.9 0 0.91 -1.39 0.91 -1.4 0.9 0 0.91 0 0.93 -1.39 0.93 -1.39 0.91 0 0.93 0 0.94 -1.38 0.94 -1.39 0.93 0 0.94 0 0.95 -1.39 0.95 -1.38 0.94 
0 0.95 0 0.96 -1.39 0.96 -1.39 0.95 0 0.96 0 0.98 -1.4 0.98 -1.39 0.96 0 0.98 0 0.99 -1.4 0.99 -1.4 0.98 0 0.99 0 1 -1.4 1 -1.4 0.99
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 72.6 135.26 -20.88 72.18 135.16 -20.59 73.11 135.16 -20.86 72.01 134.91 -20.11
 73.52 134.91 -20.55 72.15 134.6 -19.62 73.66 134.6 -20.06 72.56 134.35 -19.31
 73.49 134.35 -19.58 73.07 134.25 -19.29 73.07 33.9 -19.29 72.56 33.9 -19.31
 73.49 33.9 -19.58 72.15 33.9 -19.62 73.66 33.9 -20.06 72.01 33.9 -20.11
 73.52 33.9 -20.55 72.18 33.9 -20.59 73.11 33.9 -20.86 72.6 33.9 -20.88
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.59 0 0.6 -1.68 0.6 -1.68 0.59 0 0.6 0 0.62 -1.68 0.62 -1.68 0.6 
0 0.62 0 0.63 -1.67 0.63 -1.68 0.62 0 0.63 0 0.64 -1.67 0.64 -1.67 0.63 0 0.64 0 0.65 -1.67 0.65 -1.67 0.64 0 0.65 0 0.67 -1.67 0.67 -1.67 0.65 
0 0.67 0 0.68 -1.67 0.68 -1.67 0.67 0 0.68 0 0.69 -1.68 0.69 -1.67 0.68 0 0.69 0 0.7 -1.68 0.7 -1.68 0.69 0 0.7 0 0.72 -1.68 0.72 -1.68 0.7
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 74.85 129.59 -11.4 74.4 129.49 -11.17 75.36 129.49 -11.32 74.16 129.24 -10.72
 75.72 129.24 -10.96 74.24 128.93 -10.21 75.8 128.93 -10.46 74.6 128.68 -9.85
 75.56 128.68 -10 75.11 128.58 -9.77 75.11 33.9 -9.77 74.6 33.9 -9.85
 75.56 33.9 -10 74.24 33.9 -10.21 75.8 33.9 -10.46 74.16 33.9 -10.72
 75.72 33.9 -10.96 74.4 33.9 -11.17 75.36 33.9 -11.32 74.85 33.9 -11.4
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.45 0 0.46 -1.59 0.46 -1.59 0.45 0 0.46 0 0.47 -1.58 0.47 -1.59 0.46 
0 0.47 0 0.49 -1.58 0.49 -1.58 0.47 0 0.49 0 0.5 -1.57 0.5 -1.58 0.49 0 0.5 0 0.51 -1.57 0.51 -1.57 0.5 0 0.51 0 0.52 -1.57 0.52 -1.57 0.51 
0 0.52 0 0.54 -1.58 0.54 -1.57 0.52 0 0.54 0 0.55 -1.58 0.55 -1.58 0.54 0 0.55 0 0.56 -1.59 0.56 -1.58 0.55 0 0.56 0 0.58 -1.59 0.58 -1.59 0.56
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 75.84 123.92 -1.71 75.36 123.83 -1.54 76.33 123.83 -1.57 75.07 123.57 -1.12
 76.64 123.57 -1.16 75.09 123.26 -0.61 76.66 123.26 -0.65 75.4 123.01 -0.21
 76.37 123.01 -0.23 75.88 122.92 -0.06 75.88 33.9 -0.06 75.4 33.9 -0.21
 76.37 33.9 -0.23 75.09 33.9 -0.61 76.66 33.9 -0.65 75.07 33.9 -1.12
 76.64 33.9 -1.16 75.36 33.9 -1.54 76.33 33.9 -1.57 75.84 33.9 -1.71
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.7 0 0.71 -1.49 0.71 -1.5 0.7 0 0.71 0 0.72 -1.49 0.72 -1.49 0.71 
0 0.72 0 0.73 -1.48 0.73 -1.49 0.72 0 0.73 0 0.75 -1.48 0.75 -1.48 0.73 0 0.75 0 0.76 -1.48 0.76 -1.48 0.75 0 0.76 0 0.77 -1.48 0.77 -1.48 0.76 
0 0.77 0 0.79 -1.48 0.79 -1.48 0.77 0 0.79 0 0.8 -1.49 0.8 -1.48 0.79 0 0.8 0 0.81 -1.49 0.81 -1.49 0.8 0 0.81 0 0.82 -1.5 0.82 -1.49 0.81
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 75.56 118.26 8.01 75.06 118.16 8.11 76.03 118.16 8.22 74.72 117.91 8.49
 76.28 117.91 8.66 74.67 117.6 9 76.23 117.6 9.17 74.92 117.35 9.44
 75.89 117.35 9.55 75.39 117.25 9.65 75.39 33.9 9.65 74.92 33.9 9.44
 75.89 33.9 9.55 74.67 33.9 9 76.23 33.9 9.17 74.72 33.9 8.49
 76.28 33.9 8.66 75.06 33.9 8.11 76.03 33.9 8.22 75.56 33.9 8.01
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.6 0 0.61 -1.4 0.61 -1.4 0.6 0 0.61 0 0.62 -1.4 0.62 -1.4 0.61 
0 0.62 0 0.63 -1.39 0.63 -1.4 0.62 0 0.63 0 0.65 -1.39 0.65 -1.39 0.63 0 0.65 0 0.66 -1.38 0.66 -1.39 0.65 0 0.66 0 0.67 -1.39 0.67 -1.38 0.66 
0 0.67 0 0.68 -1.39 0.68 -1.39 0.67 0 0.68 0 0.7 -1.4 0.7 -1.39 0.68 0 0.7 0 0.71 -1.4 0.71 -1.4 0.7 0 0.71 0 0.72 -1.4 0.72 -1.4 0.71
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 74.01 112.59 17.62 73.5 112.5 17.66 74.44 112.5 17.89 73.11 112.25 17.99
 74.64 112.25 18.36 72.99 111.93 18.49 74.52 111.93 18.86 73.19 111.68 18.96
 74.13 111.68 19.19 73.62 111.59 19.23 73.62 11.24 19.23 73.19 11.24 18.96
 74.13 11.24 19.19 72.99 11.24 18.49 74.52 11.24 18.86 73.11 11.24 17.99
 74.64 11.24 18.36 73.5 11.24 17.66 74.44 11.24 17.89 74.01 11.24 17.62
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.5 0 0.51 -1.68 0.51 -1.68 0.5 0 0.51 0 0.53 -1.68 0.53 -1.68 0.51 
0 0.53 0 0.54 -1.67 0.54 -1.68 0.53 0 0.54 0 0.55 -1.67 0.55 -1.67 0.54 0 0.55 0 0.57 -1.67 0.57 -1.67 0.55 0 0.57 0 0.58 -1.67 0.58 -1.67 0.57 
0 0.58 0 0.59 -1.67 0.59 -1.67 0.58 0 0.59 0 0.6 -1.68 0.6 -1.67 0.59 0 0.6 0 0.62 -1.68 0.62 -1.68 0.6 0 0.62 0 0.63 -1.68 0.63 -1.68 0.62
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 71.21 106.92 26.95 70.7 106.83 26.92 71.61 106.83 27.27 70.27 106.58 27.2
 71.74 106.58 27.77 70.09 106.27 27.68 71.55 106.27 28.24 70.22 106.02 28.17
 71.13 106.02 28.52 70.62 105.92 28.49 70.62 11.24 28.49 70.22 11.24 28.17
 71.13 11.24 28.52 70.09 11.24 27.68 71.55 11.24 28.24 70.27 11.24 27.2
 71.74 11.24 27.77 70.7 11.24 26.92 71.61 11.24 27.27 71.21 11.24 26.95
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.47 0 0.49 -1.59 0.49 -1.59 0.47 0 0.49 0 0.5 -1.58 0.5 -1.59 0.49 
0 0.5 0 0.51 -1.58 0.51 -1.58 0.5 0 0.51 0 0.52 -1.57 0.52 -1.58 0.51 0 0.52 0 0.54 -1.57 0.54 -1.57 0.52 0 0.54 0 0.55 -1.57 0.55 -1.57 0.54 
0 0.55 0 0.56 -1.58 0.56 -1.57 0.55 0 0.56 0 0.58 -1.58 0.58 -1.58 0.56 0 0.58 0 0.59 -1.59 0.59 -1.58 0.58 0 0.59 0 0.6 -1.59 0.6 -1.59 0.59
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 67.22 101.26 35.83 66.72 101.16 35.74 67.57 101.16 36.2 66.25 100.91 35.96
 67.63 100.91 36.71 66.01 100.6 36.41 67.39 100.6 37.16 66.08 100.35 36.91
 66.93 100.35 37.38 66.43 100.25 37.28 66.43 11.24 37.28 66.08 11.24 36.91
 66.93 11.24 37.38 66.01 11.24 36.41 67.39 11.24 37.16 66.25 11.24 35.96
 67.63 11.24 36.71 66.72 11.24 35.74 67.57 11.24 36.2 67.22 11.24 35.83
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.35 0 0.36 -1.49 0.36 -1.5 0.35 0 0.36 0 0.37 -1.49 0.37 -1.49 0.36 
0 0.37 0 0.39 -1.48 0.39 -1.49 0.37 0 0.39 0 0.4 -1.48 0.4 -1.48 0.39 0 0.4 0 0.41 -1.48 0.41 -1.48 0.4 0 0.41 0 0.42 -1.48 0.42 -1.48 0.41 
0 0.42 0 0.44 -1.48 0.44 -1.48 0.42 0 0.44 0 0.45 -1.49 0.45 -1.48 0.44 0 0.45 0 0.46 -1.49 0.46 -1.49 0.45 0 0.46 0 0.48 -1.5 0.48 -1.49 0.46
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 62.1 95.6 44.11 61.62 95.5 43.95 62.4 95.5 44.52 61.13 95.25 44.11
 62.4 95.25 45.03 60.83 94.94 44.52 62.1 94.94 45.44 60.83 94.69 45.03
 61.61 94.69 45.6 61.13 94.59 45.44 61.13 11.24 45.44 60.83 11.24 45.03
 61.61 11.24 45.6 60.83 11.24 44.52 62.1 11.24 45.44 61.13 11.24 44.11
 62.4 11.24 45.03 61.62 11.24 43.95 62.4 11.24 44.52 62.1 11.24 44.11
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.4 0 0.42 -1.4 0.42 -1.4 0.4 0 0.42 0 0.43 -1.4 0.43 -1.4 0.42 
0 0.43 0 0.44 -1.39 0.44 -1.4 0.43 0 0.44 0 0.46 -1.39 0.46 -1.39 0.44 0 0.46 0 0.47 -1.38 0.47 -1.39 0.46 0 0.47 0 0.48 -1.39 0.48 -1.38 0.47 
0 0.48 0 0.49 -1.39 0.49 -1.39 0.48 0 0.49 0 0.51 -1.4 0.51 -1.39 0.49 0 0.51 0 0.52 -1.4 0.52 -1.4 0.51 0 0.52 0 0.53 -1.4 0.53 -1.4 0.52
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 55.94 89.93 51.65 55.48 89.83 51.43 56.19 89.83 52.1 54.98 89.58 51.52
 56.12 89.58 52.61 54.63 89.27 51.89 55.77 89.27 52.97 54.56 89.02 52.4
 55.27 89.02 53.07 54.81 88.92 52.85 54.81 -11.43 52.85 54.56 -11.43 52.4
 55.27 -11.43 53.07 54.63 -11.43 51.89 55.77 -11.43 52.97 54.98 -11.43 51.52
 56.12 -11.43 52.61 55.48 -11.43 51.43 56.19 -11.43 52.1 55.94 -11.43 51.65
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.92 0 0.94 -1.68 0.94 -1.68 0.92 0 0.94 0 0.95 -1.68 0.95 -1.68 0.94 
0 0.95 0 0.96 -1.67 0.96 -1.68 0.95 0 0.96 0 0.97 -1.67 0.97 -1.67 0.96 0 0.97 0 0.99 -1.67 0.99 -1.67 0.97 0 0.99 0 1 -1.67 1 -1.67 0.99 
0 1 0 1.01 -1.67 1.01 -1.67 1 0 1.01 0 1.02 -1.68 1.02 -1.67 1.01 0 1.02 0 1.04 -1.68 1.04 -1.68 1.02 0 1.04 0 1.05 -1.68 1.05 -1.68 1.04
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 48.85 84.26 58.32 48.42 84.16 58.05 49.03 84.16 58.8 47.91 83.91 58.07
 48.9 83.91 59.29 47.52 83.6 58.39 48.5 83.6 59.61 47.38 83.35 58.88
 47.99 83.35 59.64 47.57 83.25 59.36 47.57 -11.43 59.36 47.38 -11.43 58.88
 47.99 -11.43 59.64 47.52 -11.43 58.39 48.5 -11.43 59.61 47.91 -11.43 58.07
 48.9 -11.43 59.29 48.42 -11.43 58.05 49.03 -11.43 58.8 48.85 -11.43 58.32
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 1.23 0 1.25 -1.59 1.25 -1.59 1.23 0 1.25 0 1.26 -1.58 1.26 -1.59 1.25 
0 1.26 0 1.27 -1.58 1.27 -1.58 1.26 0 1.27 0 1.28 -1.57 1.28 -1.58 1.27 0 1.28 0 1.3 -1.57 1.3 -1.57 1.28 0 1.3 0 1.31 -1.57 1.31 -1.57 1.3 
0 1.31 0 1.32 -1.58 1.32 -1.57 1.31 0 1.32 0 1.34 -1.58 1.34 -1.58 1.32 0 1.34 0 1.35 -1.59 1.35 -1.58 1.34 0 1.35 0 1.36 -1.59 1.36 -1.59 1.35
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 40.95 78.59 64.01 40.56 78.5 63.68 41.06 78.5 64.51 40.05 78.24 63.64
 40.87 78.24 64.98 39.61 77.93 63.9 40.43 77.93 65.25 39.42 77.68 64.38
 39.92 77.68 65.2 39.54 77.59 64.87 39.54 -11.43 64.87 39.42 -11.43 64.38
 39.92 -11.43 65.2 39.61 -11.43 63.9 40.43 -11.43 65.25 40.05 -11.43 63.64
 40.87 -11.43 64.98 40.56 -11.43 63.68 41.06 -11.43 64.51 40.95 -11.43 64.01
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 1.06 0 1.07 -1.49 1.07 -1.5 1.06 0 1.07 0 1.08 -1.49 1.08 -1.49 1.07 
0 1.08 0 1.1 -1.48 1.1 -1.49 1.08 0 1.1 0 1.11 -1.48 1.11 -1.48 1.1 0 1.11 0 1.12 -1.48 1.12 -1.48 1.11 0 1.12 0 1.14 -1.48 1.14 -1.48 1.12 
0 1.14 0 1.15 -1.48 1.15 -1.48 1.14 0 1.15 0 1.16 -1.49 1.16 -1.48 1.15 0 1.16 0 1.17 -1.49 1.17 -1.49 1.16 0 1.17 0 1.19 -1.5 1.19 -1.49 1.17
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 32.38 72.93 68.61 32.04 72.83 68.23 32.43 72.83 69.12 31.54 72.58 68.13
 32.17 72.58 69.56 31.07 72.27 68.33 31.7 72.27 69.77 30.81 72.02 68.77
 31.21 72.02 69.66 30.87 71.93 69.28 30.87 -11.43 69.28 30.81 -11.43 68.77
 31.21 -11.43 69.66 31.07 -11.43 68.33 31.7 -11.43 69.77 31.54 -11.43 68.13
 32.17 -11.43 69.56 32.04 -11.43 68.23 32.43 -11.43 69.12 32.38 -11.43 68.61
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.89 0 0.9 -1.4 0.9 -1.4 0.89 0 0.9 0 0.91 -1.4 0.91 -1.4 0.9 
0 0.91 0 0.92 -1.39 0.92 -1.4 0.91 0 0.92 0 0.94 -1.39 0.94 -1.39 0.92 0 0.94 0 0.95 -1.38 0.95 -1.39 0.94 0 0.95 0 0.96 -1.39 0.96 -1.38 0.95 
0 0.96 0 0.97 -1.39 0.97 -1.39 0.96 0 0.97 0 0.99 -1.4 0.99 -1.39 0.97 0 0.99 0 1 -1.4 1 -1.4 0.99 0 1 0 1.01 -1.4 1.01 -1.4 1
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 23.27 67.26 72.06 22.98 67.17 71.64 23.25 67.17 72.57 22.5 66.92 71.47
 22.94 66.92 72.97 22.01 66.61 71.61 22.45 66.61 73.12 21.7 66.35 72.01
 21.97 66.35 72.94 21.68 66.26 72.52 21.68 -34.09 72.52 21.7 -34.09 72.01
 21.97 -34.09 72.94 22.01 -34.09 71.61 22.45 -34.09 73.12 22.5 -34.09 71.47
 22.94 -34.09 72.97 22.98 -34.09 71.64 23.25 -34.09 72.57 23.27 -34.09 72.06
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.64 0 0.65 -1.68 0.65 -1.68 0.64 0 0.65 0 0.67 -1.68 0.67 -1.68 0.65 
0 0.67 0 0.68 -1.67 0.68 -1.68 0.67 0 0.68 0 0.69 -1.67 0.69 -1.67 0.68 0 0.69 0 0.71 -1.67 0.71 -1.67 0.69 0 0.71 0 0.72 -1.67 0.72 -1.67 0.71 
0 0.72 0 0.73 -1.67 0.73 -1.67 0.72 0 0.73 0 0.74 -1.68 0.74 -1.67 0.73 0 0.74 0 0.76 -1.68 0.76 -1.68 0.74 0 0.76 0 0.77 -1.68 0.77 -1.68 0.76
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 13.79 61.6 74.28 13.56 61.5 73.83 13.7 61.5 74.79 13.1 61.25 73.6
 13.34 61.25 75.15 12.6 60.94 73.67 12.84 60.94 75.23 12.24 60.69 74.03
 12.38 60.69 74.99 12.15 60.59 74.54 12.15 -34.09 74.54 12.24 -34.09 74.03
 12.38 -34.09 74.99 12.6 -34.09 73.67 12.84 -34.09 75.23 13.1 -34.09 73.6
 13.34 -34.09 75.15 13.56 -34.09 73.83 13.7 -34.09 74.79 13.79 -34.09 74.28
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.35 0 0.36 -1.59 0.36 -1.59 0.35 0 0.36 0 0.38 -1.58 0.38 -1.59 0.36 
0 0.38 0 0.39 -1.58 0.39 -1.58 0.38 0 0.39 0 0.4 -1.57 0.4 -1.58 0.39 0 0.4 0 0.42 -1.57 0.42 -1.57 0.4 0 0.42 0 0.43 -1.57 0.43 -1.57 0.42 
0 0.43 0 0.44 -1.58 0.44 -1.57 0.43 0 0.44 0 0.45 -1.58 0.45 -1.58 0.44 0 0.45 0 0.47 -1.59 0.47 -1.58 0.45 0 0.47 0 0.48 -1.59 0.48 -1.59 0.47
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 4.1 55.93 75.25 3.93 55.83 74.77 3.95 55.83 75.74 3.51 55.58 74.48
 3.54 55.58 76.05 3 55.27 74.49 3.03 55.27 76.06 2.59 55.02 74.8
 2.61 55.02 75.77 2.44 54.92 75.29 2.44 -34.09 75.29 2.59 -34.09 74.8
 2.61 -34.09 75.77 3 -34.09 74.49 3.03 -34.09 76.06 3.51 -34.09 74.48
 3.54 -34.09 76.05 3.93 -34.09 74.77 3.95 -34.09 75.74 4.1 -34.09 75.25
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 1.09 0 1.1 -1.49 1.1 -1.5 1.09 0 1.1 0 1.12 -1.49 1.12 -1.49 1.1 
0 1.12 0 1.13 -1.48 1.13 -1.49 1.12 0 1.13 0 1.14 -1.48 1.14 -1.48 1.13 0 1.14 0 1.15 -1.48 1.15 -1.48 1.14 0 1.15 0 1.17 -1.48 1.17 -1.48 1.15 
0 1.17 0 1.18 -1.48 1.18 -1.48 1.17 0 1.18 0 1.19 -1.49 1.19 -1.48 1.18 0 1.19 0 1.2 -1.49 1.2 -1.49 1.19 0 1.2 0 1.22 -1.5 1.22 -1.49 1.2
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -5.63 50.27 74.94 -5.73 50.17 74.44 -5.84 50.17 75.4 -6.11 49.92 74.1
 -6.28 49.92 75.66 -6.62 49.61 74.04 -6.79 49.61 75.6 -7.06 49.36 74.3
 -7.16 49.36 75.26 -7.27 49.26 74.76 -7.27 -34.09 74.76 -7.06 -34.09 74.3
 -7.16 -34.09 75.26 -6.62 -34.09 74.04 -6.79 -34.09 75.6 -6.11 -34.09 74.1
 -6.28 -34.09 75.66 -5.73 -34.09 74.44 -5.84 -34.09 75.4 -5.63 -34.09 74.94
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.73 0 0.74 -1.4 0.74 -1.4 0.73 0 0.74 0 0.75 -1.4 0.75 -1.4 0.74 
0 0.75 0 0.76 -1.39 0.76 -1.4 0.75 0 0.76 0 0.78 -1.39 0.78 -1.39 0.76 0 0.78 0 0.79 -1.38 0.79 -1.39 0.78 0 0.79 0 0.8 -1.39 0.8 -1.38 0.79 
0 0.8 0 0.82 -1.39 0.82 -1.39 0.8 0 0.82 0 0.83 -1.4 0.83 -1.39 0.82 0 0.83 0 0.84 -1.4 0.84 -1.4 0.83 0 0.84 0 0.85 -1.4 0.85 -1.4 0.84
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -15.24 44.6 73.36 -15.27 44.5 72.85 -15.5 44.5 73.79 -15.6 44.25 72.46
 -15.98 44.25 73.99 -16.1 43.94 72.34 -16.47 43.94 73.87 -16.57 43.69 72.53
 -16.8 43.69 73.48 -16.84 43.59 72.97 -16.84 -56.76 72.97 -16.57 -56.76 72.53
 -16.8 -56.76 73.48 -16.1 -56.76 72.34 -16.47 -56.76 73.87 -15.6 -56.76 72.46
 -15.98 -56.76 73.99 -15.27 -56.76 72.85 -15.5 -56.76 73.79 -15.24 -56.76 73.36
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.05 0 0.06 -1.68 0.06 -1.68 0.05 0 0.06 0 0.07 -1.68 0.07 -1.68 0.06 
0 0.07 0 0.08 -1.67 0.08 -1.68 0.07 0 0.08 0 0.1 -1.67 0.1 -1.67 0.08 0 0.1 0 0.11 -1.67 0.11 -1.67 0.1 0 0.11 0 0.12 -1.67 0.12 -1.67 0.11 
0 0.12 0 0.13 -1.67 0.13 -1.67 0.12 0 0.13 0 0.15 -1.68 0.15 -1.67 0.13 0 0.15 0 0.16 -1.68 0.16 -1.68 0.15 0 0.16 0 0.17 -1.68 0.17 -1.68 0.16
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -24.56 38.93 70.54 -24.53 38.83 70.03 -24.88 38.83 70.93 -24.8 38.58 69.6
 -25.37 38.58 71.06 -25.28 38.27 69.41 -25.85 38.27 70.88 -25.77 38.02 69.54
 -26.12 38.02 70.45 -26.1 37.93 69.94 -26.1 -56.76 69.94 -25.77 -56.76 69.54
 -26.12 -56.76 70.45 -25.28 -56.76 69.41 -25.85 -56.76 70.88 -24.8 -56.76 69.6
 -25.37 -56.76 71.06 -24.53 -56.76 70.03 -24.88 -56.76 70.93 -24.56 -56.76 70.54
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.45 0 0.46 -1.59 0.46 -1.59 0.45 0 0.46 0 0.47 -1.58 0.47 -1.59 0.46 
0 0.47 0 0.49 -1.58 0.49 -1.58 0.47 0 0.49 0 0.5 -1.57 0.5 -1.58 0.49 0 0.5 0 0.51 -1.57 0.51 -1.57 0.5 0 0.51 0 0.52 -1.57 0.52 -1.57 0.51 
0 0.52 0 0.54 -1.58 0.54 -1.57 0.52 0 0.54 0 0.55 -1.58 0.55 -1.58 0.54 0 0.55 0 0.56 -1.59 0.56 -1.58 0.55 0 0.56 0 0.58 -1.59 0.58 -1.59 0.56
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -33.43 33.26 66.52 -33.33 33.17 66.02 -33.8 33.17 66.87 -33.55 32.92 65.56
 -34.31 32.92 66.93 -34 32.6 65.31 -34.75 32.6 66.69 -34.5 32.35 65.38
 -34.97 32.35 66.23 -34.88 32.26 65.73 -34.88 -56.76 65.73 -34.5 -56.76 65.38
 -34.97 -56.76 66.23 -34 -56.76 65.31 -34.75 -56.76 66.69 -33.55 -56.76 65.56
 -34.31 -56.76 66.93 -33.33 -56.76 66.02 -33.8 -56.76 66.87 -33.43 -56.76 66.52
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.64 0 0.65 -1.49 0.65 -1.5 0.64 0 0.65 0 0.67 -1.49 0.67 -1.49 0.65 
0 0.67 0 0.68 -1.48 0.68 -1.49 0.67 0 0.68 0 0.69 -1.48 0.69 -1.48 0.68 0 0.69 0 0.7 -1.48 0.7 -1.48 0.69 0 0.7 0 0.72 -1.48 0.72 -1.48 0.7 
0 0.72 0 0.73 -1.48 0.73 -1.48 0.72 0 0.73 0 0.74 -1.49 0.74 -1.48 0.73 0 0.74 0 0.75 -1.49 0.75 -1.49 0.74 0 0.75 0 0.77 -1.5 0.77 -1.49 0.75
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -41.69 27.6 61.38 -41.53 27.51 60.9 -42.1 27.51 61.68 -41.68 27.25 60.41
 -42.61 27.25 61.68 -42.1 26.94 60.11 -43.02 26.94 61.38 -42.61 26.69 60.11
 -43.18 26.69 60.89 -43.02 26.6 60.41 -43.02 -56.76 60.41 -42.61 -56.76 60.11
 -43.18 -56.76 60.89 -42.1 -56.76 60.11 -43.02 -56.76 61.38 -41.68 -56.76 60.41
 -42.61 -56.76 61.68 -41.53 -56.76 60.9 -42.1 -56.76 61.68 -41.69 -56.76 61.38
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.78 0 0.8 -1.4 0.8 -1.4 0.78 0 0.8 0 0.81 -1.4 0.81 -1.4 0.8 
0 0.81 0 0.82 -1.39 0.82 -1.4 0.81 0 0.82 0 0.83 -1.39 0.83 -1.39 0.82 0 0.83 0 0.85 -1.38 0.85 -1.39 0.83 0 0.85 0 0.86 -1.39 0.86 -1.38 0.85 
0 0.86 0 0.87 -1.39 0.87 -1.39 0.86 0 0.87 0 0.88 -1.4 0.88 -1.39 0.87 0 0.88 0 0.9 -1.4 0.9 -1.4 0.88 0 0.9 0 0.91 -1.4 0.91 -1.4 0.9
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -49.22 21.93 55.2 -48.99 21.84 54.74 -49.66 21.84 55.45 -49.08 21.59 54.24
 -50.17 21.59 55.38 -49.45 21.28 53.89 -50.54 21.28 55.02 -49.96 21.02 53.82
 -50.63 21.02 54.52 -50.41 20.93 54.06 -50.41 -79.42 54.06 -49.96 -79.42 53.82
 -50.63 -79.42 54.52 -49.45 -79.42 53.89 -50.54 -79.42 55.02 -49.08 -79.42 54.24
 -50.17 -79.42 55.38 -48.99 -79.42 54.74 -49.66 -79.42 55.45 -49.22 -79.42 55.2
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.33 0 0.34 -1.68 0.34 -1.68 0.33 0 0.34 0 0.35 -1.68 0.35 -1.68 0.34 
0 0.35 0 0.37 -1.67 0.37 -1.68 0.35 0 0.37 0 0.38 -1.67 0.38 -1.67 0.37 0 0.38 0 0.39 -1.67 0.39 -1.67 0.38 0 0.39 0 0.4 -1.67 0.4 -1.67 0.39 
0 0.4 0 0.42 -1.67 0.42 -1.67 0.4 0 0.42 0 0.43 -1.68 0.43 -1.67 0.42 0 0.43 0 0.44 -1.68 0.44 -1.68 0.43 0 0.44 0 0.46 -1.68 0.46 -1.68 0.44
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -55.87 16.27 48.09 -55.59 16.17 47.67 -56.35 16.17 48.27 -55.61 15.92 47.16
 -56.84 15.92 48.14 -55.93 15.61 46.76 -57.16 15.61 47.74 -56.42 15.36 46.62
 -57.18 15.36 47.23 -56.9 15.26 46.8 -56.9 -79.42 46.8 -56.42 -79.42 46.62
 -57.18 -79.42 47.23 -55.93 -79.42 46.76 -57.16 -79.42 47.74 -55.61 -79.42 47.16
 -56.84 -79.42 48.14 -55.59 -79.42 47.67 -56.35 -79.42 48.27 -55.87 -79.42 48.09
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 1.01 0 1.03 -1.59 1.03 -1.59 1.01 0 1.03 0 1.04 -1.58 1.04 -1.59 1.03 
0 1.04 0 1.05 -1.58 1.05 -1.58 1.04 0 1.05 0 1.07 -1.57 1.07 -1.58 1.05 0 1.07 0 1.08 -1.57 1.08 -1.57 1.07 0 1.08 0 1.09 -1.57 1.09 -1.57 1.08 
0 1.09 0 1.1 -1.58 1.1 -1.57 1.09 0 1.1 0 1.12 -1.58 1.12 -1.58 1.1 0 1.12 0 1.13 -1.59 1.13 -1.58 1.12 0 1.13 0 1.14 -1.59 1.14 -1.59 1.13
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -61.54 10.6 40.17 -61.2 10.5 39.79 -62.03 10.5 40.29 -61.16 10.25 39.28
 -62.5 10.25 40.09 -61.42 9.94 38.84 -62.77 9.94 39.65 -61.89 9.69 38.64
 -62.72 9.69 39.15 -62.39 9.59 38.76 -62.39 -79.42 38.76 -61.89 -79.42 38.64
 -62.72 -79.42 39.15 -61.42 -79.42 38.84 -62.77 -79.42 39.65 -61.16 -79.42 39.28
 -62.5 -79.42 40.09 -61.2 -79.42 39.79 -62.03 -79.42 40.29 -61.54 -79.42 40.17
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.12 0 0.13 -1.49 0.13 -1.5 0.12 0 0.13 0 0.15 -1.49 0.15 -1.49 0.13 
0 0.15 0 0.16 -1.48 0.16 -1.49 0.15 0 0.16 0 0.17 -1.48 0.17 -1.48 0.16 0 0.17 0 0.19 -1.48 0.19 -1.48 0.17 0 0.19 0 0.2 -1.48 0.2 -1.48 0.19 
0 0.2 0 0.21 -1.48 0.21 -1.48 0.2 0 0.21 0 0.22 -1.49 0.22 -1.48 0.21 0 0.22 0 0.24 -1.49 0.24 -1.49 0.22 0 0.24 0 0.25 -1.5 0.25 -1.49 0.24
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -66.11 4.94 31.59 -65.73 4.84 31.25 -66.62 4.84 31.64 -65.62 4.59 30.75
 -67.06 4.59 31.38 -65.83 4.28 30.28 -67.27 4.28 30.92 -66.27 4.03 30.03
 -67.16 4.03 30.42 -66.78 3.93 30.08 -66.78 -79.42 30.08 -66.27 -79.42 30.03
 -67.16 -79.42 30.42 -65.83 -79.42 30.28 -67.27 -79.42 30.92 -65.62 -79.42 30.75
 -67.06 -79.42 31.38 -65.73 -79.42 31.25 -66.62 -79.42 31.64 -66.11 -79.42 31.59
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.03 0 0.04 -1.4 0.04 -1.4 0.03 0 0.04 0 0.06 -1.4 0.06 -1.4 0.04 
0 0.06 0 0.07 -1.39 0.07 -1.4 0.06 0 0.07 0 0.08 -1.39 0.08 -1.39 0.07 0 0.08 0 0.09 -1.38 0.09 -1.39 0.08 0 0.09 0 0.11 -1.39 0.11 -1.38 0.09 
0 0.11 0 0.12 -1.39 0.12 -1.39 0.11 0 0.12 0 0.13 -1.4 0.13 -1.39 0.12 0 0.13 0 0.15 -1.4 0.15 -1.4 0.13 0 0.15 0 0.16 -1.4 0.16 -1.4 0.15
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -69.53 -0.73 22.47 -69.11 -0.83 22.19 -70.04 -0.83 22.46 -68.94 -1.08 21.71
 -70.45 -1.08 22.14 -69.08 -1.39 21.22 -70.59 -1.39 21.65 -69.48 -1.64 20.9
 -70.42 -1.64 21.17 -69.99 -1.74 20.89 -69.99 -102.09 20.89 -69.48 -102.09 20.9
 -70.42 -102.09 21.17 -69.08 -102.09 21.22 -70.59 -102.09 21.65 -68.94 -102.09 21.71
 -70.45 -102.09 22.14 -69.11 -102.09 22.19 -70.04 -102.09 22.46 -69.53 -102.09 22.47
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.8 0 0.82 -1.68 0.82 -1.68 0.8 0 0.82 0 0.83 -1.68 0.83 -1.68 0.82 
0 0.83 0 0.84 -1.67 0.84 -1.68 0.83 0 0.84 0 0.86 -1.67 0.86 -1.67 0.84 0 0.86 0 0.87 -1.67 0.87 -1.67 0.86 0 0.87 0 0.88 -1.67 0.88 -1.67 0.87 
0 0.88 0 0.89 -1.67 0.89 -1.67 0.88 0 0.89 0 0.91 -1.68 0.91 -1.67 0.89 0 0.91 0 0.92 -1.68 0.92 -1.68 0.91 0 0.92 0 0.93 -1.68 0.93 -1.68 0.92
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -71.73 -6.4 12.98 -71.28 -6.49 12.76 -72.24 -6.49 12.9 -71.04 -6.75 12.3
 -72.59 -6.75 12.54 -71.12 -7.06 11.8 -72.67 -7.06 12.03 -71.48 -7.31 11.44
 -72.44 -7.31 11.58 -71.98 -7.4 11.35 -71.98 -102.09 11.35 -71.48 -102.09 11.44
 -72.44 -102.09 11.58 -71.12 -102.09 11.8 -72.67 -102.09 12.03 -71.04 -102.09 12.3
 -72.59 -102.09 12.54 -71.28 -102.09 12.76 -72.24 -102.09 12.9 -71.73 -102.09 12.98
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 1.02 0 1.04 -1.59 1.04 -1.59 1.02 0 1.04 0 1.05 -1.58 1.05 -1.59 1.04 
0 1.05 0 1.06 -1.58 1.06 -1.58 1.05 0 1.06 0 1.07 -1.57 1.07 -1.58 1.06 0 1.07 0 1.09 -1.57 1.09 -1.57 1.07 0 1.09 0 1.1 -1.57 1.1 -1.57 1.09 
0 1.1 0 1.11 -1.58 1.11 -1.57 1.1 0 1.11 0 1.13 -1.58 1.13 -1.58 1.11 0 1.13 0 1.14 -1.59 1.14 -1.58 1.13 0 1.14 0 1.15 -1.59 1.15 -1.59 1.14
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -72.67 -12.07 3.29 -72.19 -12.16 3.12 -73.16 -12.16 3.14 -71.9 -12.41 2.71
 -73.47 -12.41 2.74 -71.91 -12.72 2.2 -73.48 -12.72 2.23 -72.22 -12.98 1.79
 -73.19 -12.98 1.81 -72.7 -13.07 1.64 -72.7 -102.09 1.64 -72.22 -102.09 1.79
 -73.19 -102.09 1.81 -71.91 -102.09 2.2 -73.48 -102.09 2.23 -71.9 -102.09 2.71
 -73.47 -102.09 2.74 -72.19 -102.09 3.12 -73.16 -102.09 3.14 -72.67 -102.09 3.29
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 1.24 0 1.25 -1.49 1.25 -1.5 1.24 0 1.25 0 1.26 -1.49 1.26 -1.49 1.25 
0 1.26 0 1.27 -1.48 1.27 -1.49 1.26 0 1.27 0 1.29 -1.48 1.29 -1.48 1.27 0 1.29 0 1.3 -1.48 1.3 -1.48 1.29 0 1.3 0 1.31 -1.48 1.31 -1.48 1.3 
0 1.31 0 1.33 -1.48 1.33 -1.48 1.31 0 1.33 0 1.34 -1.49 1.34 -1.48 1.33 0 1.34 0 1.35 -1.49 1.35 -1.49 1.34 0 1.35 0 1.36 -1.5 1.36 -1.49 1.35
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -72.34 -17.73 -6.43 -71.84 -17.82 -6.53 -72.8 -17.82 -6.64 -71.49 -18.08 -6.91
 -73.05 -18.08 -7.08 -71.44 -18.39 -7.42 -73 -18.39 -7.59 -71.69 -18.64 -7.86
 -72.65 -18.64 -7.97 -72.15 -18.73 -8.07 -72.15 -102.09 -8.07 -71.69 -102.09 -7.86
 -72.65 -102.09 -7.97 -71.44 -102.09 -7.42 -73 -102.09 -7.59 -71.49 -102.09 -6.91
 -73.05 -102.09 -7.08 -71.84 -102.09 -6.53 -72.8 -102.09 -6.64 -72.34 -102.09 -6.43
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.62 0 0.64 -1.4 0.64 -1.4 0.62 0 0.64 0 0.65 -1.4 0.65 -1.4 0.64 
0 0.65 0 0.66 -1.39 0.66 -1.4 0.65 0 0.66 0 0.67 -1.39 0.67 -1.39 0.66 0 0.67 0 0.69 -1.38 0.69 -1.39 0.67 0 0.69 0 0.7 -1.39 0.7 -1.38 0.69 
0 0.7 0 0.71 -1.39 0.71 -1.39 0.7 0 0.71 0 0.73 -1.4 0.73 -1.39 0.71 0 0.73 0 0.74 -1.4 0.74 -1.4 0.73 0 0.74 0 0.75 -1.4 0.75 -1.4 0.74
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -70.73 -23.4 -16.03 -70.22 -23.49 -16.07 -71.16 -23.49 -16.3 -69.83 -23.74 -16.4
 -71.36 -23.74 -16.78 -69.71 -24.05 -16.9 -71.23 -24.05 -17.27 -69.9 -24.3 -17.37
 -70.84 -24.3 -17.6 -70.33 -24.4 -17.64 -70.33 -124.75 -17.64 -69.9 -124.75 -17.37
 -70.84 -124.75 -17.6 -69.71 -124.75 -16.9 -71.23 -124.75 -17.27 -69.83 -124.75 -16.4
 -71.36 -124.75 -16.78 -70.22 -124.75 -16.07 -71.16 -124.75 -16.3 -70.73 -124.75 -16.03
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.12 0 0.14 -1.68 0.14 -1.68 0.12 0 0.14 0 0.15 -1.68 0.15 -1.68 0.14 
0 0.15 0 0.16 -1.67 0.16 -1.68 0.15 0 0.16 0 0.17 -1.67 0.17 -1.67 0.16 0 0.17 0 0.19 -1.67 0.19 -1.67 0.17 0 0.19 0 0.2 -1.67 0.2 -1.67 0.19 
0 0.2 0 0.21 -1.67 0.21 -1.67 0.2 0 0.21 0 0.22 -1.68 0.22 -1.67 0.21 0 0.22 0 0.24 -1.68 0.24 -1.68 0.22 0 0.24 0 0.25 -1.68 0.25 -1.68 0.24
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -67.88 -29.06 -25.35 -67.37 -29.16 -25.32 -68.28 -29.16 -25.67 -66.94 -29.41 -25.59
 -68.4 -29.41 -26.17 -66.76 -29.72 -26.07 -68.22 -29.72 -26.64 -66.89 -29.97 -26.56
 -67.79 -29.97 -26.92 -67.28 -30.07 -26.89 -67.28 -124.75 -26.89 -66.89 -124.75 -26.56
 -67.79 -124.75 -26.92 -66.76 -124.75 -26.07 -68.22 -124.75 -26.64 -66.94 -124.75 -25.59
 -68.4 -124.75 -26.17 -67.37 -124.75 -25.32 -68.28 -124.75 -25.67 -67.88 -124.75 -25.35
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 1.07 0 1.08 -1.59 1.08 -1.59 1.07 0 1.08 0 1.1 -1.58 1.1 -1.59 1.08 
0 1.1 0 1.11 -1.58 1.11 -1.58 1.1 0 1.11 0 1.12 -1.57 1.12 -1.58 1.11 0 1.12 0 1.13 -1.57 1.13 -1.57 1.12 0 1.13 0 1.15 -1.57 1.15 -1.57 1.13 
0 1.15 0 1.16 -1.58 1.16 -1.57 1.15 0 1.16 0 1.17 -1.58 1.17 -1.58 1.16 0 1.17 0 1.19 -1.59 1.19 -1.58 1.17 0 1.19 0 1.2 -1.59 1.2 -1.59 1.19
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -63.84 -34.73 -34.21 -63.34 -34.83 -34.11 -64.19 -34.83 -34.58 -62.88 -35.08 -34.33
 -64.25 -35.08 -35.09 -62.63 -35.39 -34.78 -64 -35.39 -35.53 -62.69 -35.64 -35.28
 -63.54 -35.64 -35.75 -63.04 -35.74 -35.65 -63.04 -124.75 -35.65 -62.69 -124.75 -35.28
 -63.54 -124.75 -35.75 -62.63 -124.75 -34.78 -64 -124.75 -35.53 -62.88 -124.75 -34.33
 -64.25 -124.75 -35.09 -63.34 -124.75 -34.11 -64.19 -124.75 -34.58 -63.84 -124.75 -34.21
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.72 0 0.73 -1.49 0.73 -1.5 0.72 0 0.73 0 0.74 -1.49 0.74 -1.49 0.73 
0 0.74 0 0.76 -1.48 0.76 -1.49 0.74 0 0.76 0 0.77 -1.48 0.77 -1.48 0.76 0 0.77 0 0.78 -1.48 0.78 -1.48 0.77 0 0.78 0 0.8 -1.48 0.8 -1.48 0.78 
0 0.8 0 0.81 -1.48 0.81 -1.48 0.8 0 0.81 0 0.82 -1.49 0.82 -1.48 0.81 0 0.82 0 0.83 -1.49 0.83 -1.49 0.82 0 0.83 0 0.85 -1.5 0.85 -1.49 0.83
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -58.68 -40.39 -42.46 -58.2 -40.49 -42.29 -58.98 -40.49 -42.87 -57.71 -40.74 -42.45
 -58.97 -40.74 -43.38 -57.41 -41.05 -42.86 -58.67 -41.05 -43.79 -57.4 -41.3 -43.37
 -58.18 -41.3 -43.95 -57.7 -41.4 -43.78 -57.7 -124.75 -43.78 -57.4 -124.75 -43.37
 -58.18 -124.75 -43.95 -57.41 -124.75 -42.86 -58.67 -124.75 -43.79 -57.71 -124.75 -42.45
 -58.97 -124.75 -43.38 -58.2 -124.75 -42.29 -58.98 -124.75 -42.87 -58.68 -124.75 -42.46
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 1.18 0 1.19 -1.4 1.19 -1.4 1.18 0 1.19 0 1.2 -1.4 1.2 -1.4 1.19 
0 1.2 0 1.22 -1.39 1.22 -1.4 1.2 0 1.22 0 1.23 -1.39 1.23 -1.39 1.22 0 1.23 0 1.24 -1.38 1.24 -1.39 1.23 0 1.24 0 1.25 -1.39 1.25 -1.38 1.24 
0 1.25 0 1.27 -1.39 1.27 -1.39 1.25 0 1.27 0 1.28 -1.4 1.28 -1.39 1.27 0 1.28 0 1.29 -1.4 1.29 -1.4 1.28 0 1.29 0 1.3 -1.4 1.3 -1.4 1.29
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -52.48 -46.06 -49.96 -52.02 -46.16 -49.74 -52.72 -46.16 -50.41 -51.52 -46.41 -49.83
 -52.65 -46.41 -50.92 -51.17 -46.72 -50.2 -52.3 -46.72 -51.29 -51.1 -46.97 -50.7
 -51.79 -46.97 -51.38 -51.34 -47.07 -51.15 -51.34 -147.42 -51.15 -51.1 -147.42 -50.7
 -51.79 -147.42 -51.38 -51.17 -147.42 -50.2 -52.3 -147.42 -51.29 -51.52 -147.42 -49.83
 -52.65 -147.42 -50.92 -52.02 -147.42 -49.74 -52.72 -147.42 -50.41 -52.48 -147.42 -49.96
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.33 0 0.35 -1.68 0.35 -1.68 0.33 0 0.35 0 0.36 -1.68 0.36 -1.68 0.35 
0 0.36 0 0.37 -1.67 0.37 -1.68 0.36 0 0.37 0 0.38 -1.67 0.38 -1.67 0.37 0 0.38 0 0.4 -1.67 0.4 -1.67 0.38 0 0.4 0 0.41 -1.67 0.41 -1.67 0.4 
0 0.41 0 0.42 -1.67 0.42 -1.67 0.41 0 0.42 0 0.43 -1.68 0.43 -1.67 0.42 0 0.43 0 0.45 -1.68 0.45 -1.68 0.43 0 0.45 0 0.46 -1.68 0.46 -1.68 0.45
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -45.35 -51.73 -56.6 -44.93 -51.82 -56.32 -45.53 -51.82 -57.08 -44.42 -52.08 -56.34
 -45.39 -52.08 -57.57 -44.02 -52.39 -56.66 -45 -52.39 -57.89 -43.88 -52.64 -57.15
 -44.49 -52.64 -57.91 -44.06 -52.73 -57.63 -44.06 -147.42 -57.63 -43.88 -147.42 -57.15
 -44.49 -147.42 -57.91 -44.02 -147.42 -56.66 -45 -147.42 -57.89 -44.42 -147.42 -56.34
 -45.39 -147.42 -57.57 -44.93 -147.42 -56.32 -45.53 -147.42 -57.08 -45.35 -147.42 -56.6
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.69 0 0.7 -1.59 0.7 -1.59 0.69 0 0.7 0 0.71 -1.58 0.71 -1.59 0.7 
0 0.71 0 0.73 -1.58 0.73 -1.58 0.71 0 0.73 0 0.74 -1.57 0.74 -1.58 0.73 0 0.74 0 0.75 -1.57 0.75 -1.57 0.74 0 0.75 0 0.77 -1.57 0.77 -1.57 0.75 
0 0.77 0 0.78 -1.58 0.78 -1.57 0.77 0 0.78 0 0.79 -1.58 0.79 -1.58 0.78 0 0.79 0 0.8 -1.59 0.8 -1.58 0.79 0 0.8 0 0.82 -1.59 0.82 -1.59 0.8
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -37.42 -57.4 -62.24 -37.03 -57.49 -61.91 -37.53 -57.49 -62.74 -36.52 -57.74 -61.87
 -37.33 -57.74 -63.21 -36.09 -58.05 -62.13 -36.89 -58.05 -63.47 -35.89 -58.31 -62.6
 -36.39 -58.31 -63.43 -36 -58.4 -63.1 -36 -147.42 -63.1 -35.89 -147.42 -62.6
 -36.39 -147.42 -63.43 -36.09 -147.42 -62.13 -36.89 -147.42 -63.47 -36.52 -147.42 -61.87
 -37.33 -147.42 -63.21 -37.03 -147.42 -61.91 -37.53 -147.42 -62.74 -37.42 -147.42 -62.24
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 1.03 0 1.04 -1.49 1.04 -1.5 1.03 0 1.04 0 1.06 -1.49 1.06 -1.49 1.04 
0 1.06 0 1.07 -1.48 1.07 -1.49 1.06 0 1.07 0 1.08 -1.48 1.08 -1.48 1.07 0 1.08 0 1.1 -1.48 1.1 -1.48 1.08 0 1.1 0 1.11 -1.48 1.11 -1.48 1.1 
0 1.11 0 1.12 -1.48 1.12 -1.48 1.11 0 1.12 0 1.13 -1.49 1.13 -1.48 1.12 0 1.13 0 1.15 -1.49 1.15 -1.49 1.13 0 1.15 0 1.16 -1.5 1.16 -1.49 1.15
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -28.82 -63.06 -66.8 -28.48 -63.15 -66.42 -28.87 -63.15 -67.31 -27.98 -63.4 -66.31
 -28.61 -63.4 -67.75 -27.52 -63.72 -66.51 -28.14 -63.72 -67.95 -27.26 -63.97 -66.95
 -27.64 -63.97 -67.84 -27.31 -64.06 -67.46 -27.31 -147.42 -67.46 -27.26 -147.42 -66.95
 -27.64 -147.42 -67.84 -27.52 -147.42 -66.51 -28.14 -147.42 -67.95 -27.98 -147.42 -66.31
 -28.61 -147.42 -67.75 -28.48 -147.42 -66.42 -28.87 -147.42 -67.31 -28.82 -147.42 -66.8
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.49 0 0.5 -1.4 0.5 -1.4 0.49 0 0.5 0 0.51 -1.4 0.51 -1.4 0.5 
0 0.51 0 0.53 -1.39 0.53 -1.4 0.51 0 0.53 0 0.54 -1.39 0.54 -1.39 0.53 0 0.54 0 0.55 -1.38 0.55 -1.39 0.54 0 0.55 0 0.56 -1.39 0.56 -1.38 0.55 
0 0.56 0 0.58 -1.39 0.58 -1.39 0.56 0 0.58 0 0.59 -1.4 0.59 -1.39 0.58 0 0.59 0 0.6 -1.4 0.6 -1.4 0.59 0 0.6 0 0.61 -1.4 0.61 -1.4 0.6
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -19.69 -68.72 -70.19 -19.41 -68.82 -69.77 -19.68 -68.82 -70.7 -18.93 -69.07 -69.6
 -19.36 -69.07 -71.11 -18.44 -69.38 -69.74 -18.87 -69.38 -71.25 -18.12 -69.63 -70.14
 -18.39 -69.63 -71.07 -18.11 -69.73 -70.65 -18.11 -170.08 -70.65 -18.12 -170.08 -70.14
 -18.39 -170.08 -71.07 -18.44 -170.08 -69.74 -18.87 -170.08 -71.25 -18.93 -170.08 -69.6
 -19.36 -170.08 -71.11 -19.41 -170.08 -69.77 -19.68 -170.08 -70.7 -19.69 -170.08 -70.19
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.88 0 0.89 -1.68 0.89 -1.68 0.88 0 0.89 0 0.91 -1.68 0.91 -1.68 0.89 
0 0.91 0 0.92 -1.67 0.92 -1.68 0.91 0 0.92 0 0.93 -1.67 0.93 -1.67 0.92 0 0.93 0 0.95 -1.67 0.95 -1.67 0.93 0 0.95 0 0.96 -1.67 0.96 -1.67 0.95 
0 0.96 0 0.97 -1.67 0.97 -1.67 0.96 0 0.97 0 0.98 -1.68 0.98 -1.67 0.97 0 0.98 0 1 -1.68 1 -1.68 0.98 0 1 0 1.01 -1.68 1.01 -1.68 1
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -10.2 -74.39 -72.37 -9.97 -74.49 -71.91 -10.12 -74.49 -72.87 -9.52 -74.74 -71.67
 -9.75 -74.74 -73.23 -9.02 -75.05 -71.75 -9.25 -75.05 -73.3 -8.65 -75.3 -72.11
 -8.79 -75.3 -73.07 -8.57 -75.4 -72.61 -8.57 -170.08 -72.61 -8.65 -170.08 -72.11
 -8.79 -170.08 -73.07 -9.02 -170.08 -71.75 -9.25 -170.08 -73.3 -9.52 -170.08 -71.67
 -9.75 -170.08 -73.23 -9.97 -170.08 -71.91 -10.12 -170.08 -72.87 -10.2 -170.08 -72.37
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.91 0 0.92 -1.59 0.92 -1.59 0.91 0 0.92 0 0.93 -1.58 0.93 -1.59 0.92 
0 0.93 0 0.94 -1.58 0.94 -1.58 0.93 0 0.94 0 0.96 -1.57 0.96 -1.58 0.94 0 0.96 0 0.97 -1.57 0.97 -1.57 0.96 0 0.97 0 0.98 -1.57 0.98 -1.57 0.97 
0 0.98 0 1 -1.58 1 -1.57 0.98 0 1 0 1.01 -1.58 1.01 -1.58 1 0 1.01 0 1.02 -1.59 1.02 -1.58 1.01 0 1.02 0 1.03 -1.59 1.03 -1.59 1.02
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -0.5 -80.06 -73.28 -0.34 -80.16 -72.8 -0.35 -80.16 -73.77 0.08 -80.41 -72.5
 0.05 -80.41 -74.07 0.59 -80.72 -72.51 0.56 -80.72 -74.08 1 -80.97 -72.82
 0.98 -80.97 -73.79 1.15 -81.07 -73.31 1.15 -170.08 -73.31 1 -170.08 -72.82
 0.98 -170.08 -73.79 0.59 -170.08 -72.51 0.56 -170.08 -74.08 0.08 -170.08 -72.5
 0.05 -170.08 -74.07 -0.34 -170.08 -72.8 -0.35 -170.08 -73.77 -0.5 -170.08 -73.28
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.37 0 0.38 -1.49 0.38 -1.5 0.37 0 0.38 0 0.39 -1.49 0.39 -1.49 0.38 
0 0.39 0 0.4 -1.48 0.4 -1.49 0.39 0 0.4 0 0.42 -1.48 0.42 -1.48 0.4 0 0.42 0 0.43 -1.48 0.43 -1.48 0.42 0 0.43 0 0.44 -1.48 0.44 -1.48 0.43 
0 0.44 0 0.46 -1.48 0.46 -1.48 0.44 0 0.46 0 0.47 -1.49 0.47 -1.48 0.46 0 0.47 0 0.48 -1.49 0.48 -1.49 0.47 0 0.48 0 0.49 -1.5 0.49 -1.49 0.48
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="balusterTex"></texture>
                    <material is="x3d" use="balusterMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1 1 3 4 2 -1 3 5 6 4 -1 5 7 8 6 -1 
7 9 8 -1 10 11 12 -1 11 13 14 12 -1 13 15 16 14 -1 
15 17 18 16 -1 17 19 18 -1 19 17 1 0 -1 17 15 3 1 -1 
15 13 5 3 -1 13 11 7 5 -1 11 10 9 7 -1 10 12 8 9 -1 
12 14 6 8 -1 14 16 4 6 -1 16 18 2 4 -1 18 19 0 2 -1

"
                    texcoordindex="0 1 2 -1 3 4 5 6 -1 7 8 9 10 -1 11 12 13 14 -1 
15 16 17 -1 18 19 20 -1 21 22 23 24 -1 25 26 27 28 -1 
29 30 31 32 -1 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 
44 45 46 47 -1 48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 
60 61 62 63 -1 64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 9.22 -85.72 -72.92 9.32 -85.82 -72.42 9.43 -85.82 -73.38 9.69 -86.07 -72.07
 9.87 -86.07 -73.63 10.2 -86.38 -72.01 10.38 -86.38 -73.57 10.65 -86.63 -72.26
 10.76 -86.63 -73.23 10.86 -86.73 -72.73 10.86 -170.08 -72.73 10.65 -170.08 -72.26
 10.76 -170.08 -73.23 10.2 -170.08 -72.01 10.38 -170.08 -73.57 9.69 -170.08 -72.07
 9.87 -170.08 -73.63 9.32 -170.08 -72.42 9.43 -170.08 -73.38 9.22 -170.08 -72.92
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 -0 0.01 0 -0.01 0 0 -0 0.01 -0 -0.03 0 -0.02 0 0 -0.01 0 -0.01 -0.03 0 -0.03 0 0 -0 -0 -0 -0.03 0 -0.03 
0 0 0 -0.01 0 -0.02 0 0 0.01 -0.01 0 0.02 0 0 0.01 -0 0.01 0.04 0 0.03 0 0 0.01 0 0.01 0.04 0 0.04 
0 0 0.01 0.01 0.01 0.04 0 0.04 0 0 0.01 0.02 0 0.03 0 0.8 0 0.81 -1.4 0.81 -1.4 0.8 0 0.81 0 0.82 -1.4 0.82 -1.4 0.81 
0 0.82 0 0.83 -1.39 0.83 -1.4 0.82 0 0.83 0 0.85 -1.39 0.85 -1.39 0.83 0 0.85 0 0.86 -1.38 0.86 -1.39 0.85 0 0.86 0 0.87 -1.39 0.87 -1.38 0.86 
0 0.87 0 0.89 -1.39 0.89 -1.39 0.87 0 0.89 0 0.9 -1.4 0.9 -1.39 0.89 0 0.9 0 0.91 -1.4 0.91 -1.4 0.9 0 0.91 0 0.92 -1.4 0.92 -1.4 0.91
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="wellTex"></texture>
                    <material is="x3d" use="wellMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1 4 5 6 7 -1 5 8 9 6 -1 8 10 11 9 -1 
10 12 13 11 -1 12 14 15 13 -1 14 16 17 15 -1 16 18 19 17 -1 
18 20 21 19 -1 20 22 23 21 -1 22 24 25 23 -1 24 26 27 25 -1 
26 28 29 27 -1 28 30 31 29 -1 30 32 33 31 -1 32 34 35 33 -1 
34 36 37 35 -1 36 38 39 37 -1 38 40 41 39 -1 40 42 43 41 -1 
42 44 45 43 -1 44 46 47 45 -1 46 48 49 47 -1 5 4 1 -1 
1 8 5 -1 1 10 8 -1 1 12 10 -1 1 14 12 -1 
1 16 14 -1 1 18 16 -1 1 20 18 -1 1 22 20 -1 
1 24 22 -1 1 26 24 -1 1 28 26 -1 1 30 28 -1 
1 32 30 -1 0 34 32 -1 32 1 0 -1 0 36 34 -1 
0 38 36 -1 0 40 38 -1 0 42 40 -1 0 44 42 -1 
0 46 44 -1 0 48 46 -1
"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 55 -1 56 57 58 59 -1 60 61 62 63 -1 
64 65 66 67 -1 68 69 70 71 -1 72 73 74 75 -1 76 77 78 79 -1 
80 81 82 83 -1 84 85 86 87 -1 88 89 90 91 -1 92 93 94 -1 
95 96 97 -1 98 99 100 -1 101 102 103 -1 104 105 106 -1 
107 108 109 -1 110 111 112 -1 113 114 115 -1 116 117 118 -1 
119 120 121 -1 122 123 124 -1 125 126 127 -1 128 129 130 -1 
131 132 133 -1 134 135 136 -1 137 138 139 -1 140 141 142 -1 
143 144 145 -1 146 147 148 -1 149 150 151 -1 152 153 154 -1 
155 156 157 -1 158 159 160 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -177.6 94.9 177.15 177.61 94.9 177.15 177.61 101.88 177.15 -177.6 101.88 177.15
 77.61 94.9 6.31 76.13 94.9 16.83 76.13 101.88 16.83 77.61 101.88 6.31
 73.2 94.9 27.05 73.2 101.88 27.05 68.87 94.9 36.77 68.87 101.88 36.77
 63.24 94.9 45.78 63.24 101.88 45.78 56.41 94.9 53.92 56.41 101.88 53.92
 48.51 94.9 61.04 48.51 101.88 61.04 39.69 94.9 66.98 39.69 101.88 66.98
 30.14 94.9 71.64 30.14 101.88 71.64 20.03 94.9 74.93 20.03 101.88 74.93
 9.56 94.9 76.77 9.56 101.88 76.77 -1.07 94.9 77.15 -1.07 101.88 77.15
 -11.64 94.9 76.03 -11.64 101.88 76.03 -21.95 94.9 73.46 -21.95 101.88 73.46
 -31.81 94.9 69.48 -31.81 101.88 69.48 -41.02 94.9 64.16 -41.02 101.88 64.16
 -49.4 94.9 57.62 -49.4 101.88 57.62 -56.78 94.9 49.97 -56.78 101.88 49.97
 -63.03 94.9 41.37 -63.03 101.88 41.37 -68.02 94.9 31.98 -68.02 101.88 31.98
 -71.66 94.9 22 -71.66 101.88 22 -73.87 94.9 11.6 -73.87 101.88 11.6
 -74.61 94.9 0.99 -74.61 101.88 0.99"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -0.17 5.92 -0.17 5.92 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 
0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 
0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 
0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 
0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 
0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 2.52 4.21 2.54 3.95 4.21 8.22 
4.21 8.22 2.47 4.47 2.52 4.21 4.21 8.22 2.4 4.71 2.47 4.47 4.21 8.22 2.3 4.93 2.4 4.71 4.21 8.22 2.19 5.14 2.3 4.93 
4.21 8.22 2.06 5.32 2.19 5.14 4.21 8.22 1.91 5.46 2.06 5.32 4.21 8.22 1.75 5.58 1.91 5.46 4.21 8.22 1.58 5.66 1.75 5.58 
4.21 8.22 1.41 5.71 1.58 5.66 4.21 8.22 1.23 5.72 1.41 5.71 4.21 8.22 1.05 5.69 1.23 5.72 4.21 8.22 0.88 5.63 1.05 5.69 
4.21 8.22 0.72 5.53 0.88 5.63 -1.71 8.22 0.56 5.39 0.72 5.53 0.72 5.53 4.21 8.22 -1.71 8.22 -1.71 8.22 0.43 5.23 0.56 5.39 
-1.71 8.22 0.3 5.04 0.43 5.23 -1.71 8.22 0.2 4.82 0.3 5.04 -1.71 8.22 0.11 4.59 0.2 4.82 -1.71 8.22 0.05 4.34 0.11 4.59 
-1.71 8.22 0.02 4.08 0.05 4.34 -1.71 8.22 0 3.81 0.02 4.08"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="wellTex"></texture>
                    <material is="x3d" use="wellMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1 4 5 6 7 -1 5 4 1 0 -1
"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 177.61 94.9 177.15 177.61 94.9 -177.14 177.61 101.88 -177.14 177.61 101.88 177.15
 77.61 94.9 -4.32 77.61 94.9 6.31 77.61 101.88 6.31 77.61 101.88 -4.32
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -0.17 5.91 -0.17 5.91 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 2.54 3.95 2.54 3.68 4.21 -0.64 4.21 8.22"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="wellTex"></texture>
                    <material is="x3d" use="wellMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1 4 5 6 7 -1 5 8 9 6 -1 8 10 11 9 -1 
10 12 13 11 -1 12 14 15 13 -1 14 16 17 15 -1 16 18 19 17 -1 
18 20 21 19 -1 20 22 23 21 -1 22 24 25 23 -1 24 26 27 25 -1 
26 28 29 27 -1 8 5 4 -1 1 10 8 -1 8 4 1 -1 
1 12 10 -1 1 14 12 -1 0 16 14 -1 14 1 0 -1 
0 18 16 -1 0 20 18 -1 0 22 20 -1 0 24 22 -1 
0 26 24 -1 0 28 26 -1
"
                    texcoordindex="0 1 2 3 -1 4 5 6 7 -1 8 9 10 11 -1 12 13 14 15 -1 
16 17 18 19 -1 20 21 22 23 -1 24 25 26 27 -1 28 29 30 31 -1 
32 33 34 35 -1 36 37 38 39 -1 40 41 42 43 -1 44 45 46 47 -1 
48 49 50 51 -1 52 53 54 -1 55 56 57 -1 58 59 60 -1 
61 62 63 -1 64 65 66 -1 67 68 69 -1 70 71 72 -1 
73 74 75 -1 76 77 78 -1 79 80 81 -1 82 83 84 -1 
85 86 87 -1 88 89 90 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 177.61 94.9 -177.14 -177.6 94.9 -177.14 -177.6 101.88 -177.14 177.61 101.88 -177.14
 -74.61 94.9 0.99 1.59 94.9 0.99 1.59 101.88 0.99 -74.61 101.88 0.99
 1.59 94.9 -75.21 1.59 101.88 -75.21 20.03 94.9 -72.95 20.03 101.88 -72.95
 30.14 94.9 -69.66 30.14 101.88 -69.66 39.69 94.9 -65 39.69 101.88 -65
 48.51 94.9 -59.06 48.51 101.88 -59.06 56.41 94.9 -51.94 56.41 101.88 -51.94
 63.24 94.9 -43.8 63.24 101.88 -43.8 68.87 94.9 -34.78 68.87 101.88 -34.78
 73.2 94.9 -25.07 73.2 101.88 -25.07 76.13 94.9 -14.85 76.13 101.88 -14.85
 77.61 94.9 -4.32 77.61 101.88 -4.32"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -0.17 5.92 -0.17 5.92 0 0 0 0 -0.17 1.27 -0.17 1.27 0 0 0 0 -0.17 1.27 -0.17 1.27 0 0 0 0 -0.17 0.31 -0.17 0.31 0 0 0 
0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 
0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 0 -0.17 0.18 -0.17 0.18 0 0 0 
0 -0.17 0.18 -0.17 0.18 0 0 0 1.27 1.91 1.27 3.81 0 3.81 -1.71 -0.64 1.58 1.97 1.27 1.91 1.27 1.91 0 3.81 -1.71 -0.64 
-1.71 -0.64 1.75 2.05 1.58 1.97 -1.71 -0.64 1.91 2.17 1.75 2.05 4.21 -0.64 2.06 2.31 1.91 2.17 1.91 2.17 -1.71 -0.64 4.21 -0.64 
4.21 -0.64 2.19 2.49 2.06 2.31 4.21 -0.64 2.3 2.7 2.19 2.49 4.21 -0.64 2.4 2.92 2.3 2.7 4.21 -0.64 2.47 3.16 2.4 2.92 
4.21 -0.64 2.52 3.42 2.47 3.16 4.21 -0.64 2.54 3.68 2.52 3.42"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="wellTex"></texture>
                    <material is="x3d" use="wellMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1 4 1 0 -1
"
                    texcoordindex="0 1 2 3 -1 4 5 6 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -177.6 94.9 -177.14 -177.6 94.9 177.15 -177.6 101.88 177.15 -177.6 101.88 -177.14
 -74.61 94.9 0.99"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 -0.17 5.91 -0.17 5.91 0 0 0 0 3.81 -1.71 8.22 -1.71 -0.64"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="floorTex"></texture>
                    <material is="x3d" use="floorMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="1 2 3 -1 23 24 0 -1 0 22 23 -1 0 21 22 -1 
0 20 21 -1 0 19 20 -1 0 18 19 -1 0 17 18 -1 
0 16 17 -1 0 15 16 -1 0 14 15 -1 0 13 14 -1 
0 12 13 -1 0 11 12 -1 0 10 11 -1 0 9 10 -1 
1 8 9 -1 9 0 1 -1 1 7 8 -1 1 6 7 -1 
1 5 6 -1 1 4 5 -1 1 3 4 -1
"
                    texcoordindex="0 1 2 -1 3 4 5 -1 6 7 8 -1 9 10 11 -1 
12 13 14 -1 15 16 17 -1 18 19 20 -1 21 22 23 -1 
24 25 26 -1 27 28 29 -1 30 31 32 -1 33 34 35 -1 
36 37 38 -1 39 40 41 -1 42 43 44 -1 45 46 47 -1 
48 49 50 -1 51 52 53 -1 54 55 56 -1 57 58 59 -1 
60 61 62 -1 63 64 65 -1 66 67 68 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -177.6 101.88 177.15 177.61 101.88 177.15 77.61 101.88 6.31 76.13 101.88 16.83
 73.2 101.88 27.05 68.87 101.88 36.77 63.24 101.88 45.78 56.41 101.88 53.92
 48.51 101.88 61.04 39.69 101.88 66.98 30.14 101.88 71.64 20.03 101.88 74.93
 9.56 101.88 76.77 -1.07 101.88 77.15 -11.64 101.88 76.03 -21.95 101.88 73.46
 -31.81 101.88 69.48 -41.02 101.88 64.16 -49.4 101.88 57.62 -56.78 101.88 49.97
 -63.03 101.88 41.37 -68.02 101.88 31.98 -71.66 101.88 22 -73.87 101.88 11.6
 -74.61 101.88 0.99"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="4.21 -8.21 2.54 -3.94 2.52 -4.2 0.02 -4.07 0 -3.81 -1.71 -8.21 -1.71 -8.21 0.05 -4.33 0.02 -4.07 -1.71 -8.21 0.11 -4.58 0.05 -4.33 
-1.71 -8.21 0.2 -4.81 0.11 -4.58 -1.71 -8.21 0.3 -5.03 0.2 -4.81 -1.71 -8.21 0.43 -5.22 0.3 -5.03 -1.71 -8.21 0.56 -5.38 0.43 -5.22 
-1.71 -8.21 0.72 -5.52 0.56 -5.38 -1.71 -8.21 0.88 -5.62 0.72 -5.52 -1.71 -8.21 1.05 -5.68 0.88 -5.62 -1.71 -8.21 1.23 -5.71 1.05 -5.68 
-1.71 -8.21 1.41 -5.7 1.23 -5.71 -1.71 -8.21 1.58 -5.65 1.41 -5.7 -1.71 -8.21 1.75 -5.57 1.58 -5.65 -1.71 -8.21 1.91 -5.45 1.75 -5.57 
4.21 -8.21 2.06 -5.31 1.91 -5.45 1.91 -5.45 -1.71 -8.21 4.21 -8.21 4.21 -8.21 2.19 -5.13 2.06 -5.31 4.21 -8.21 2.3 -4.92 2.19 -5.13 
4.21 -8.21 2.4 -4.7 2.3 -4.92 4.21 -8.21 2.47 -4.46 2.4 -4.7 4.21 -8.21 2.52 -4.2 2.47 -4.46"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="floorTex"></texture>
                    <material is="x3d" use="floorMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1
"
                    texcoordindex="0 1 2 3 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 177.61 101.88 177.15 177.61 101.88 -177.14 77.61 101.88 -4.32 77.61 101.88 6.31
"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="4.21 -8.21 4.21 0.65 2.54 -3.67 2.54 -3.94"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="floorTex"></texture>
                    <material is="x3d" use="floorMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="1 2 3 4 -1 4 0 1 -1 13 14 0 -1 0 12 13 -1 
0 11 12 -1 0 10 11 -1 0 9 10 -1 0 8 9 -1 
0 7 8 -1 0 6 7 -1 0 5 6 -1 0 4 5 -1

"
                    texcoordindex="0 1 2 3 -1 4 5 6 -1 7 8 9 -1 10 11 12 -1 
13 14 15 -1 16 17 18 -1 19 20 21 -1 22 23 24 -1 
25 26 27 -1 28 29 30 -1 31 32 33 -1 34 35 36 -1
"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 177.61 101.88 -177.14 -177.6 101.88 -177.14 -74.61 101.88 0.99 1.59 101.88 0.99
 1.59 101.88 -75.21 20.03 101.88 -72.95 30.14 101.88 -69.66 39.69 101.88 -65
 48.51 101.88 -59.06 56.41 101.88 -51.94 63.24 101.88 -43.8 68.87 101.88 -34.78
 73.2 101.88 -25.07 76.13 101.88 -14.85 77.61 101.88 -4.32"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="-1.71 0.65 0 -3.81 1.27 -3.81 1.27 -1.9 1.27 -1.9 4.21 0.65 -1.71 0.65 2.52 -3.41 2.54 -3.67 4.21 0.65 4.21 0.65 2.47 -3.15 2.52 -3.41 
4.21 0.65 2.4 -2.91 2.47 -3.15 4.21 0.65 2.3 -2.69 2.4 -2.91 4.21 0.65 2.19 -2.48 2.3 -2.69 4.21 0.65 2.06 -2.3 2.19 -2.48 
4.21 0.65 1.91 -2.16 2.06 -2.3 4.21 0.65 1.75 -2.04 1.91 -2.16 4.21 0.65 1.58 -1.96 1.75 -2.04 4.21 0.65 1.27 -1.9 1.58 -1.96
"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="floorTex"></texture>
                    <material is="x3d" use="floorMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 -1"
                    texcoordindex="0 1 2 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -177.6 101.88 -177.14 -177.6 101.88 177.15 -74.61 101.88 0.99"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="-1.71 0.65 -1.71 -8.21 0 -3.81"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="floorTex"></texture>
                    <material is="x3d" use="floorMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1"
                    texcoordindex="0 1 2 3 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" 177.61 -192.85 177.15 177.61 -192.85 -177.14 -177.6 -192.85 -177.14 -177.6 -192.85 177.15"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="5.92 0 5.92 8.86 0 8.86 0 0"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,0,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              >
                <shape
                  is="x3d"
                  render="true"
                  bboxcenter="0,0,0"
                  bboxsize="-1,-1,-1"
                  ispickable="true"
                >
                  <appearance is="x3d" sorttype="auto" alphaclipthreshold="0.1">
                    <texture is="x3d" use="floorTex"></texture>
                    <material is="x3d" use="floorMat"></material>
                  </appearance>
                  <indexedfaceset
                    is="x3d"
                    coordindex="0 1 2 3 -1"
                    texcoordindex="0 1 2 3 -1"
                    solid="true"
                    ccw="true"
                    usegeocache="true"
                    lit="true"
                    colorpervertex="true"
                    normalpervertex="true"
                    normalupdatemode="fast"
                    convex="true"
                    normalindex=""
                    colorindex=""
                  >
                    <coordinate
                      is="x3d"
                      point=" -177.6 -192.86 177.15 -177.6 -192.86 -177.14 177.61 -192.86 -177.14 177.61 -192.86 177.15"
                    ></coordinate>
                    <texturecoordinate
                      is="x3d"
                      point="0 0 0 -8.85 5.92 -8.85 5.92 0"
                    ></texturecoordinate>
                  </indexedfaceset>
                </shape>
              </transform>
              <transform
                is="x3d"
                id="transformLeftView"
                render="true"
                bboxcenter="0,0,0"
                bboxsize="-1,-1,-1"
                center="0,0,0"
                translation="0,0,0"
                rotation="0,-1,0,0"
                scale="1,1,1"
                scaleorientation="0,0,0,0"
              ></transform>
            </scene>
          )}
        </x3d>
      </div>
    </>
  );
}
