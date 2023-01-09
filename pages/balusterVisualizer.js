import styles from '@/styles/Visualizer3.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Woods from '@/components/Woods';
import {
  TEXTURE_TYPES,
  default_texture,
  targetTextureIds,
  red_oak_texture,
  white_oak_texture,
  yellow_pine_texture,
  blackTexture,
  whiteTexture,
} from '../components/textures_woods';

export async function x3DLoad() {
  return await import('x3dom');
}

const X3D_NAMESPACE = 'https://www.web3d.org/specifications/x3d-3.3.xsd';
const CAMERA_DEF = 'CA_camera';

export default function BalusterVisualizer() {
  const [selectedTexture, setSelectedTexture] = useState(default_texture);
  const [targetTextureElement, setTargetTextureElement] = useState();

  let elemRef = useRef();

  const addIs3D = useCallback(() => {
    console.log('AASAS', document.querySelectorAll('texture').length);
    let sceneEl = document.getElementById('inline_scene');
    let textures = document.querySelectorAll('Texture');
    console.log('textures', textures.length);
    for (let i = 0; i < textures.length; i++) {
      // if (textures[i].getAttribute('is') === undefined) {
      textures[i].setAttributeNS(X3D_NAMESPACE, 'is', 'x3d');
      // }
    }
  }, []);

  const animateTranslation = useCallback((x, y, z, speed, shape) => {
    const transform = shape.parentElement;
    let distanceX = 0;
    let distanceY = 0;
    let distanceZ = 0;
    const animate = () => {
      distanceX = distanceX += speed;
      distanceY = distanceY += speed;
      distanceZ = distanceZ += speed;
      transform.setAttribute(
        'translation',
        `${distanceX} ${distanceY} ${distanceZ}`,
      );
      x > distanceX && y > distanceY && z > distanceZ
        ? requestAnimationFrame(playStuff)
        : null;
    };
    animate();
  }, []);

  const center = useCallback((shape) => {
    console.log('elemRef', x3d);
    elemRef ? console.log('elemeRef', elemRef) : console.log('NO ELEMREF');
    console.log('elemRef.current.runtime', elemRef.current.runtime);
  }, []);

  const clearBrush = useCallback(() => {
    setSelectedTexture(null);
  }, []);

  const createObject = useCallback((objectName) => {
    let sceneEl = document.getElementById('inline_scene');
    console.log('createObject', sceneEl);
    const leftTransform = document.getElementById('leftTransform');
    if (objectName && sceneEl !== undefined && sceneEl !== null) {
      setTimeout(() => {
        const transformElement = document.createElement('Transform');
        transformElement.setAttribute('id', objectName);
        transformElement.setAttribute('name', objectName);
        transformElement.setAttribute('render', 'true');
        transformElement.setAttribute('bboxSize', '-1,-1,-1');
        transformElement.setAttribute('bboxCenter', '-1,-1,-1');
        transformElement.setAttribute('rotation', '0,0,0,0');
        transformElement.setAttribute('center', '0,0,0');
        transformElement.setAttribute('translation', '0,0,0');

        const shapeElement = document.createElementNS(X3D_NAMESPACE, 'Shape');
        shapeElement.setAttribute('render', 'true');
        shapeElement.setAttribute('bboxCenter', '0,0,0');
        shapeElement.setAttribute('bboxSize', '-1,-1,-1');
        shapeElement.setAttribute('scaleOrientation', '0,0,0,0');
        shapeElement.setAttribute('scale', '1,1,1');
        shapeElement.setAttribute('translation', '0,0,0');
        shapeElement.setAttribute('isPickable', true);
        const sphereElement = document.createElementNS(X3D_NAMESPACE, 'Sphere');
        sphereElement.setAttribute('id', 'sphere');
        sphereElement.setAttribute('radius', '0.9');
        sphereElement.setAttribute('scale', '20,20,20'); // TODO Scale, position and orientation

        const appear = document.createElementNS(X3D_NAMESPACE, 'Appearance');
        appear.setAttribute('sortType', 'auto');
        appear.setAttribute('alphaClipThreshold', '1');

        const material = document.createElementNS(X3D_NAMESPACE, 'Material');
        const texture = document.createElementNS(X3D_NAMESPACE, 'Texture');
        // texture.setAttribute('url', red_oak_texture);
        texture.setAttributeNS(X3D_NAMESPACE, 'USE', 'treadTex');
        material.setAttribute('diffuseColor', '0 0 0');

        appear.appendChild(texture);
        appear.appendChild(material);

        shapeElement.appendChild(appear);
        shapeElement.appendChild(sphereElement);

        transformElement.appendChild(shapeElement);

        console.log('transformElement', transformElement);

        if (document.getElementById('leftTransform') === null) {
          sceneEl.appendChild(transformElement);
        }
      }, 500);
    }
  }, []);

  const deselectTargetTexture = useCallback(() => {
    setTargetTextureElement(null);
  }, []);

  const doSetTargetTexture = useCallback((textureEl) => {
    let targ = !textureEl
      ? document.getElementById(targetTextureIds[0])
      : textureEl;
    setTargetTextureElement(targ);
  }, []);

  const getTexture = useCallback((textureUSEValue) => {
    let textures = document.querySelectorAll('Texture');
    return Array.from(textures).find((texture) => {
      if (
        texture.getAttribute('DEF') &&
        texture.getAttribute('DEF') === textureUSEValue
      ) {
        return texture;
      }
    });
  }, []);

  const handleShapeMouseOver = useCallback((e) => {
    const shape = e.target;
  }, []);

  const handleShapePress = useCallback(
    (e) => {
      const shape = e.target;
      const appear = shape.getElementsByTagName('Appearance')[0];
      const targetTexture = appear
        .getElementsByTagName('Texture')[0]
        .getAttribute('USE');
      const masterTexture = getTexture(targetTexture);
      masterTexture.setAttribute('url', selectedTexture);
      doSetTargetTexture(masterTexture ? masterTexture : null);
      setTimeout(() => {
        deselectTargetTexture();
        clearBrush();
      }, 600);
    },
    [
      clearBrush,
      deselectTargetTexture,
      doSetTargetTexture,
      getTexture,
      selectedTexture,
    ],
  );

  const initializeCameras = useCallback(() => {
    // const sceneEl = document.getElementById('inline_scene');
    // const viewpoints = sceneEl.getElementsByTagName('viewpoint');
    // console.log('viewpoints', viewpoints);
  }, []);

  const insertTextures = useCallback(() => {
    setTimeout(() => {
      let sceneEl = document.getElementById('inline_scene');
      const appear = sceneEl.getElementsByTagName('Appearance')[0];
      for (let j = 0; j < TEXTURE_TYPES.length; j++) {
        const textureName = TEXTURE_TYPES[j].name;
        const textURL = TEXTURE_TYPES[j].url;
        let newTexture = document.createElementNS(X3D_NAMESPACE, 'Texture');

        newTexture.setAttribute('id', textureName);
        newTexture.setAttribute('url', textURL);
        appear ? appear.appendChild(newTexture) : null;
      }
    }, 500);
  }, []);

  const initializeViewpoints = useCallback(() => {
    let sceneEl = document.getElementById('inline_scene');

    if (sceneEl !== undefined && sceneEl !== null && x3dom) {
      let viewpoint_BOTTOM;
      let viewpoint_LEFT;
      let viewpoint_RIGHT;
      let viewpoint_TOP;
      let viewpoint_FRONT;
      let viewpoint_BACK;

      if (document.getElementById('viewpoint_top') === null) {
        viewpoint_TOP = document.createElement('viewpoint');
        viewpoint_TOP.setAttribute('id', 'viewpoint_top');
        viewpoint_TOP.setAttribute('is', 'x3d');
        viewpoint_TOP.setAttribute('position', '0 0 1462');
        viewpoint_TOP.setAttributeNS(X3D_NAMESPACE, 'DEF', CAMERA_DEF);
        viewpoint_TOP.setAttribute('DEF', CAMERA_DEF);
        viewpoint_TOP.setAttribute('orientation', '1 0 0 1.57');
        viewpoint_TOP.setAttribute('zNear', '0.1');
        viewpoint_TOP.setAttribute('zFar', '100');
        sceneEl.insertBefore(viewpoint_TOP, sceneEl.firstChild);
      }

      if (document.getElementById('viewpoint_bottom') === null) {
        viewpoint_BOTTOM = document.createElement('viewpoint');
        viewpoint_BOTTOM.setAttribute('id', 'viewpoint_bottom');
        viewpoint_BOTTOM.setAttribute('position', '0 0 10');
        viewpoint_BOTTOM.setAttributeNS(X3D_NAMESPACE, 'DEF', CAMERA_DEF);
        viewpoint_BOTTOM.setAttribute('is', 'x3d');
        viewpoint_BOTTOM.setAttribute('DEF', CAMERA_DEF);
        viewpoint_BOTTOM.setAttribute('orientation', '1 0 0 -1.57');
        viewpoint_BOTTOM.setAttribute('zNear', '0.1');
        viewpoint_BOTTOM.setAttribute('zFar', '100');
        sceneEl.insertBefore(viewpoint_BOTTOM, sceneEl.firstChild);
      }

      if (document.getElementById('viewpoint_left') === null) {
        viewpoint_LEFT = document.createElement('viewpoint');
        viewpoint_LEFT.setAttribute('id', 'viewpoint_left');
        viewpoint_LEFT.setAttribute(
          'position',
          '-1460.61908 -11.86324 -46.27223',
        );
        viewpoint_LEFT.setAttributeNS(X3D_NAMESPACE, 'DEF', CAMERA_DEF);
        viewpoint_LEFT.setAttribute('is', 'x3d');
        viewpoint_LEFT.setAttribute(
          'orientation',
          '0.00393 -0.99998 0.00406 1.60248',
        );
        viewpoint_LEFT.setAttribute('zNear', '701.19780');
        viewpoint_LEFT.setAttribute('zFar', '2455.57578');
        viewpoint_LEFT.setAttribute(
          'centerOfRotation',
          '0.00000 0.00000 0.00000',
        );
        viewpoint_LEFT.setAttribute('fieldOfView', '0.78540');
        sceneEl.insertBefore(viewpoint_LEFT, sceneEl.firstChild);
      }

      if (document.getElementById('viewpoint_right') === null) {
        viewpoint_RIGHT = document.createElement('viewpoint');
        viewpoint_RIGHT.setAttribute('id', 'viewpoint_right');
        viewpoint_RIGHT.setAttribute('position', '0 0 10');
        viewpoint_RIGHT.setAttributeNS(X3D_NAMESPACE, 'DEF', CAMERA_DEF);
        viewpoint_RIGHT.setAttribute('DEF', CAMERA_DEF);
        viewpoint_RIGHT.setAttribute('is', 'x3d');
        viewpoint_RIGHT.setAttribute('orientation', '1 0 0 0');
        viewpoint_RIGHT.setAttribute('zNear', '0.1');
        viewpoint_RIGHT.setAttribute('zFar', '100');
        sceneEl.insertBefore(viewpoint_RIGHT, sceneEl.firstChild);
      }

      if (document.getElementById('viewpoint_front') === null) {
        viewpoint_FRONT = document.createElement('viewpoint');
        viewpoint_FRONT.setAttribute('id', 'viewpoint_front');
        viewpoint_FRONT.setAttribute('position', '0 0 1462');
        viewpoint_FRONT.setAttributeNS(X3D_NAMESPACE, 'DEF', CAMERA_DEF);
        viewpoint_FRONT.setAttribute('is', 'x3d');
        viewpoint_FRONT.setAttribute('orientation', '0 1 0 0');
        viewpoint_FRONT.setAttribute('zNear', '0.1');
        viewpoint_FRONT.setAttribute('zFar', '100');
        sceneEl.insertBefore(viewpoint_FRONT, sceneEl.firstChild);
      }

      if (document.getElementById('viewpoint_back') === null) {
        viewpoint_BACK = document.createElement('viewpoint');
        viewpoint_BACK.setAttribute('id', 'viewpoint_back');
        viewpoint_BACK.setAttribute('position', '0 10 0');
        viewpoint_BACK.setAttributeNS(X3D_NAMESPACE, 'DEF', CAMERA_DEF);
        viewpoint_BACK.setAttribute('is', 'x3d');
        viewpoint_BACK.setAttribute('orientation', '1 0 0 0');
        viewpoint_BACK.setAttribute('zNear', '0.1');
        viewpoint_BACK.setAttribute('zFar', '100');
        sceneEl.insertBefore(viewpoint_BACK, sceneEl.firstChild);
      }

      x3dom.reload();
    }
  }, []);

  const onLoad = useCallback(() => {
    prepareAppearances();
    prepareNavigation();
    insertTextures();
    processShapes();
    createObject('foobar'); // Testing ability to inject objects into the scene
    initializeDefaultCamera();
    initializeViewpoints();
    initializeCameras();

    // Experimental
    center();
    addIs3D();
  }, []);

  const onNextPrev = useCallback(
    (typeOfCall) => {
      typeOfCall === 'next'
        ? elemRef.current.runtime.nextView()
        : elemRef.current.runtime.prevView();
    },
    [elemRef],
  );

  const processShapes = useCallback(
    (e) => {
      const sceneEl = document.getElementById('inline_scene');
      const shapes = sceneEl.getElementsByTagName('Shape');
      // setTimeout(() => {
      // Need to check for shapes because the scene is not fully loaded
      if (shapes) {
        for (let i = 0; i < shapes.length; i++) {
          let newNamePrefix = shapes[i]
            ?.getElementsByTagName('Appearance')[0]
            ?.getElementsByTagName('Texture')[0]
            ?.getAttribute('USE')
            .split('Tex')[0];

          if (
            shapes[i]?.getAttribute('id') === undefined &&
            newNamePrefix !== 'undefined'
          ) {
            shapes[i].setAttribute('id', `${newNamePrefix}Shape${i}}`);
            shapes[i].setAttribute('is', 'x3d');
          }

          shapes[i]?.addEventListener('click', handleShapePress);
          shapes[i]?.addEventListener('mouseover', handleShapeMouseOver);
        }
      }
      // }, 500);
    },
    [handleShapeMouseOver, handleShapePress],
  );

  const prepareAppearances = useCallback(() => {
    let appearEl = document
      .getElementById('inline_scene')
      .getElementsByTagName('Appearance')[0];

    console.log('appearEl', appearEl);

    if (appearEl) {
      if (appearEl.getAttribute('id') !== 'mainAppear') {
        appearEl.setAttribute('id', 'mainAppear');
        appearEl.setAttributeNS(X3D_NAMESPACE, 'is', 'x3d');
      }
    }
  }, []);

  const prepareNavigation = useCallback(() => {
    let sceneEl = document.getElementById('inline_scene');
    let x3dElem = document.getElementById('x3d');

    x3dElem.setAttribute('showStat', 'false');
    x3dElem.setAttribute('x', '0px');
    x3dElem.setAttribute('y', '0px');
    x3dElem.setAttribute('profile', 'Immersive');
    x3dElem.setAttribute('version', '3.3');

    let existingTimeSensor = sceneEl.getElementsByTagName('timesensor');

    let appearEl = document
      .getElementById('inline_scene')
      .getElementsByTagName('Appearance')[0];

    let navInfo = sceneEl.getElementsByTagName('navigationinfo')[0];
    if (navInfo && !existingTimeSensor.length > 0) {
      navInfo.setAttributeNS(X3D_NAMESPACE, 'transitionType', "'LINEAR'");
      navInfo.setAttribute('type', "'FLY'");
      let timeSensor = document.createElement('timesensor');
      timeSensor.setAttribute('is', 'x3d');
      timeSensor.setAttribute('cycleInterval', '1');
      timeSensor.setAttribute('loop', 'true');
      timeSensor.setAttributeNS(X3D_NAMESPACE, 'DEF', 'time');
      sceneEl.insertBefore(timeSensor, appearEl);
    }
  }, []);

  const initializeDefaultCamera = useCallback(() => {
    if (elemRef && x3d.getElementsByTagName('viewpoint').length === 1) {
      const vp = elemRef.current.runtime.getActiveBindable('viewpoint');
      vp.setAttribute('id', 'default_camera');
      vp.setAttribute('position', '523.68305 624.32179 957.74241');
      vp.setAttribute('orientation', '-0.70892 0.68162 0.18116 0.71737');
      vp.setAttribute('zNear', '538.06246');
      vp.setAttribute('zFar', '2210.87277');
      vp.setAttribute('centerOfRotation', '0.00000 0.00000 0.00000');
      vp.setAttribute('fieldOfView', '0.78540');
      vp.setAttribute('description', 'FOO');
      vp.setAttributeNS(X3D_NAMESPACE, 'DEF', CAMERA_DEF);

      // sceneEl.removeChild(vp);
    }
  }, []);

  const switchCamera = useCallback((viewpointId) => {
    let newVP = document.getElementById(viewpointId);
    newVP.setAttribute('set_bind', 'true');
  }, []);

  const switchBrush = useCallback(() => {
    deselectTargetTexture();
  }, [deselectTargetTexture]);

  const handleWoodClick = useCallback(
    (woodType) => {
      let textureURL = '';

      // Deselect the target element
      deselectTargetTexture();

      switch (woodType) {
        case 'black':
          textureURL = blackTexture;
          break;
        case 'red-oak':
          textureURL = red_oak_texture;
          break;
        case 'white':
          textureURL = whiteTexture;
          break;
        case 'white-oak':
          textureURL = white_oak_texture;
          break;
        case 'yellow-pine':
          textureURL = yellow_pine_texture;
          break;
        default:
          textureURL = whiteTexture;
          break;
      }

      setSelectedTexture(textureURL);
    },
    [deselectTargetTexture],
  );

  const toggleWireframe = useCallback(() => {
    elemRef.current.runtime.togglePoints(true);
  }, [elemRef]);

  // Monitor texture element and change it when selectedTexture changes
  useEffect(() => {
    targetTextureElement
      ? targetTextureElement.setAttribute('url', selectedTexture)
      : null;
  }, [selectedTexture, targetTextureElement]);

  useEffect(() => {
    if (x3dom !== undefined && x3dom !== null) {
      document
        .getElementById('x3d')
        .addEventListener('downloadsfinished', () => {
          onLoad();
        });

      x3DLoad().then((x3d) => {
        // X3DOM prototype hack to update texture on the fly
        x3dom.Texture.prototype.update = function () {
          if (x3dom.isa(this.node, x3dom.nodeTypes.Text)) {
            this.updateText();
          } else {
            this.updateTexture();
          }
        };
        // Must reload for proper rendering of the scene in Next.js
        x3dom.reload();
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
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
            Home
          </div>
          <div
            className={styles.control}
            onClick={() => switchCamera('viewpoint_front')}
          >
            Front
          </div>
          <div
            className={styles.control}
            onClick={() => switchCamera('viewpoint_back')}
          >
            Back
          </div>
          <div
            className={styles.control}
            onClick={() => switchCamera('viewpoint_left')}
          >
            Left
          </div>
          <div
            className={styles.control}
            onClick={() => switchCamera('viewpoint_right')}
          >
            Right
          </div>
          <div className={styles.control} onClick={() => toggleWireframe()}>
            Wireframe
          </div>
          <div className={styles.control} onClick={() => onNextPrev()}>
            Next
          </div>
        </div>
      </div>
      <Woods
        handleWoodPress={handleWoodClick}
        handleBrushPress={switchBrush}
        selectedTexture={selectedTexture}
      ></Woods>
      <div className={styles.visualizerWrapper}>
        <x3d is="x3d" id="x3d" ref={elemRef}>
          <scene is="x3d" id="container_scene">
            <inline
              is="x3d"
              id="inline_scene"
              nameSpaceName="balusterScene"
              mapDEFToID="true"
              url="https://prismic-io.s3.amazonaws.com/compleat/c76dfbdd-fe38-4271-a4f8-e3c673a5fdd3_3dcurve.x3d"
            ></inline>
          </scene>
        </x3d>
      </div>
    </>
  );
}
