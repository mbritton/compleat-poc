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

export default function BalusterVisualizer() {
  const [selectedTexture, setSelectedTexture] = useState(default_texture);
  const [targetTextureElement, setTargetTextureElement] = useState();

  let elemRef = useRef();

  const [currentElement, setCurrentElement] = useState();

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

  const clearBrush = useCallback(() => {
    setSelectedTexture(null);
  }, []);

  const createObject = useCallback((objectName) => {
    let sceneEl = document.getElementById('inline_scene');
    const leftTransform = document.getElementById('leftTransform');

    if (
      objectName &&
      sceneEl !== undefined &&
      sceneEl !== null &&
      x3dom &&
      leftTransform === null
    ) {
      setTimeout(() => {
        const transformElement = document.createElement('Transform');
        transformElement.setAttribute('id', objectName);
        transformElement.setAttribute('name', objectName);
        transformElement.setAttribute('render', 'true');
        transformElement.setAttribute('bboxSize', '-1,-1,-1');
        transformElement.setAttribute('bboxCenter', '-1,-1,-1');
        transformElement.setAttribute('scale', '2 2 2');
        transformElement.setAttribute('rotation', '0,0,0,0');
        transformElement.setAttribute('center', '0,0,0');
        transformElement.setAttribute('translation', '-10,0,0');
        const shapeElement = document.createElementNS(X3D_NAMESPACE, 'Shape');
        shapeElement.setAttribute('render', 'true');
        shapeElement.setAttribute('bboxCenter', '0,0,0');
        shapeElement.setAttribute('bboxSize', '-1,-1,-1');
        shapeElement.setAttribute('scaleOrientation', '0,0,0,0');
        shapeElement.setAttribute('scale', '1,1,1');
        shapeElement.setAttribute('translation', '0,0,0');
        shapeElement.setAttribute('isPickable', true);
        const sphereElement = document.createElementNS(X3D_NAMESPACE, 'Sphere');
        sphereElement.setAttribute('id', objectName);
        sphereElement.setAttribute('radius', '0.9');
        sphereElement.setAttribute('scale', '20 20 20'); // TODO Scale, position and orientation

        const appear = document.createElementNS(X3D_NAMESPACE, 'Appearance');
        appear.setAttribute('sortType', 'auto');
        appear.setAttribute('alphaClipThreshold', '1');
        const material = document.createElementNS(X3D_NAMESPACE, 'Material');
        const texture = document.createElementNS(X3D_NAMESPACE, 'Texture');
        texture.setAttribute('url', red_oak_texture);
        material.setAttribute('diffuseColor', '0 0 0');
        appear.appendChild(texture);
        appear.appendChild(material);
        shapeElement.appendChild(appear);
        shapeElement.appendChild(sphereElement);
        transformElement.appendChild(shapeElement);
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
      console.log('handleShapePress');
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
      }, 1000);
    },
    [deselectTargetTexture, doSetTargetTexture, getTexture, selectedTexture],
  );

  const insertTextures = useCallback(() => {
    setTimeout(() => {
      let sceneEl = document.getElementById('inline_scene');
      const appear = sceneEl.getElementsByTagName('Appearance')[0];
      for (let j = 0; j < TEXTURE_TYPES.length; j++) {
        const textName = TEXTURE_TYPES[j].name;
        const textURL = TEXTURE_TYPES[j].url;
        let newTexture = document.createElementNS(X3D_NAMESPACE, 'Texture');
        newTexture.setAttribute('DEF', textName);
        newTexture.setAttribute('url', textURL);
        appear ? appear.appendChild(newTexture) : null;
      }
    }, 500);
  }, []);

  const insertViewpoints = useCallback(() => {
    let sceneEl = document.getElementById('inline_scene');
    const leftTransform = document.getElementById('leftTransform');

    if (
      sceneEl !== undefined &&
      sceneEl !== null &&
      x3dom &&
      leftTransform === null
    ) {
      setTimeout(() => {
        let viewpoint_BOTTOM;
        let viewpoint_LEFT;
        let viewpoint_RIGHT;
        let viewpoint_TOP;

        if (document.getElementById('viewpoint_top') === null) {
          viewpoint_TOP = document.createElement('viewpoint');
          viewpoint_TOP.setAttribute('id', 'viewpoint_top');
          viewpoint_TOP.setAttribute('position', '0 0 10');
          viewpoint_TOP.setAttribute('orientation', '1 0 0 1.57');
          viewpoint_TOP.setAttribute('zNear', '0.1');
          viewpoint_TOP.setAttribute('zFar', '100');
          sceneEl.insertBefore(viewpoint_TOP, sceneEl.firstChild);
        }

        if (document.getElementById('viewpoint_bottom') === null) {
          viewpoint_BOTTOM = document.createElement('viewpoint');
          viewpoint_BOTTOM.setAttribute('id', 'viewpoint_bottom');
          viewpoint_BOTTOM.setAttribute('position', '0 0 10');
          viewpoint_BOTTOM.setAttribute('orientation', '1 0 0 -1.57');
          viewpoint_BOTTOM.setAttribute('zNear', '0.1');
          viewpoint_BOTTOM.setAttribute('zFar', '100');
          sceneEl.insertBefore(viewpoint_BOTTOM, sceneEl.firstChild);
        }

        if (document.getElementById('viewpoint_bottom') === null) {
          viewpoint_LEFT = document.createElement('viewpoint');
          viewpoint_LEFT.setAttribute('id', 'viewpoint_left');
          viewpoint_LEFT.setAttribute('position', '0 0 10');
          viewpoint_LEFT.setAttribute('orientation', '1 0 0 3.14');
          viewpoint_LEFT.setAttribute('zNear', '0.1');
          viewpoint_LEFT.setAttribute('zFar', '100');
          sceneEl.insertBefore(viewpoint_LEFT, sceneEl.firstChild);
        }

        if (document.getElementById('viewpoint_right') === null) {
          viewpoint_RIGHT = document.createElement('viewpoint');
          viewpoint_RIGHT.setAttribute('id', 'viewpoint_right');
          viewpoint_RIGHT.setAttribute('position', '0 0 10');
          viewpoint_RIGHT.setAttribute('orientation', '1 0 0 0');
          viewpoint_RIGHT.setAttribute('zNear', '0.1');
          viewpoint_RIGHT.setAttribute('zFar', '100');
          sceneEl.insertBefore(viewpoint_RIGHT, sceneEl.firstChild);
        }
      }, 200);
    }
  }, []);

  const onNextPrev = useCallback(
    (typeOfCall) => {
      typeOfCall === 'next'
        ? currentElement.current.runtime.nextView()
        : currentElement.current.runtime.prevView();
    },
    [currentElement],
  );

  const processShapes = useCallback(
    (e) => {
      let sceneEl = document.getElementById('inline_scene');
      const shapes = sceneEl.getElementsByTagName('Shape');
      setTimeout(() => {
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
            }

            shapes[i]?.addEventListener('click', handleShapePress);
            shapes[i]?.addEventListener('mouseover', handleShapeMouseOver);
          }
        }
      }, 500);
    },
    [handleShapeMouseOver, handleShapePress],
  );

  const prepareAppearances = useCallback(() => {
    let appearEl = document
      .getElementById('inline_scene')
      .getElementsByTagName('Appearance')[0];
    if (appearEl) {
      if (appearEl.getAttribute('id') !== 'mainAppear') {
        appearEl.setAttribute('id', 'mainAppear');
      }
    }
  }, []);

  const switchCamera = useCallback((viewpointId) => {
    document.getElementById(viewpointId).setAttribute('set_bind', 'true');
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

      // Deselect the target texture
      setSelectedTexture(textureURL);
    },
    [deselectTargetTexture],
  );

  const toggleWireframe = useCallback(() => {
    elemRef.current.runtime.togglePoints(true);
  }, [elemRef]);

  useEffect(() => {
    targetTextureElement
      ? targetTextureElement.setAttribute('url', selectedTexture)
      : null;
  }, [
    clearBrush,
    deselectTargetTexture,
    selectedTexture,
    targetTextureElement,
  ]);

  useEffect(() => {
    x3DLoad().then((x3d) => {
      if (x3dom !== undefined && x3dom !== null) {
        // X3DOM prototype hack to update texture on the fly
        x3dom.Texture.prototype.update = function () {
          if (x3dom.isa(this.node, x3dom.nodeTypes.Text)) {
            this.updateText();
          } else {
            this.updateTexture();
          }
        };
      }
      setTimeout(() => {
        elemRef ? setCurrentElement(elemRef) : null;
        prepareAppearances();
        insertTextures();
        processShapes();
        insertViewpoints();
        createObject();
      }, 500);
      // Must reload for proper rendering
      x3dom.reload();
      return () => {
        console.log('unmounting');
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            onClick={() => switchCamera('front_cam')}
          >
            Front
          </div>
          <div
            className={styles.control}
            onClick={() => switchCamera('rear_cam')}
          >
            Back
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
        <x3d id="x3d" is="x3d" ref={elemRef}>
          <scene is="x3d" id="container_scene">
            <inline
              is="x3d"
              id="inline_scene"
              nameSpaceName="balusterScene"
              mapDEFToID="true"
              url="https://prismic-io.s3.amazonaws.com/compleat/9138e104-f005-473d-9afc-d90585b1b52a_3dcurve.x3d"
            ></inline>
          </scene>
        </x3d>
      </div>
    </>
  );
}
