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

export default function BalusterVisualizer() {
  const [selectedTexture, setSelectedTexture] = useState(default_texture);
  const [targetTextureElement, setTargetTextureElement] = useState();

  let elemRef = useRef();
  let leftMatrix;

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
      console.log('handleShapePress', e);
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
    [deselectTargetTexture, doSetTargetTexture, getTexture],
  );

  const insertTextures = useCallback(() => {
    setTimeout(() => {
      let sceneEl = document.getElementById('inline_scene');
      const appear = sceneEl.getElementsByTagName('appearance')[0];

      for (let j = 0; j < TEXTURE_TYPES.length; j++) {
        const textName = TEXTURE_TYPES[j].name;
        const textURL = TEXTURE_TYPES[j].url;
        let newTexture = document.createElement('Texture');
        newTexture.setAttribute('DEF', textName);
        newTexture.setAttribute('url', textURL);
        appear.appendChild(newTexture);
      }
      console.log('appear', appear);
    }, 500);
  }, []);

  const onNextPrev = useCallback(
    (typeOfCall) => {
      typeOfCall === 'next'
        ? currentElement.current.runtime.nextView()
        : currentElement.current.runtime.prevView();
    },
    [currentElement],
  );

  const parseShapes = useCallback(
    (e) => {
      let sceneEl = document.getElementById('inline_scene');
      const shapes = sceneEl.getElementsByTagName('Shape');
      setTimeout(() => {
        if (shapes) {
          for (let i = 0; i < shapes.length; i++) {
            let newNamePrefix = shapes[i]
              ?.getElementsByTagName('Appearance')[0]
              ?.getElementsByTagName('Texture')[0]
              ?.getAttribute('USE')
              .split('Tex')[0];

            shapes[i]?.parentElement?.setAttribute(
              'id',
              newNamePrefix + 'Transform',
            );

            shapes[i].setAttribute('id', newNamePrefix + 'Shape');
            shapes[i]?.addEventListener('click', handleShapePress);
            shapes[i]?.addEventListener('mouseover', handleShapeMouseOver);
          }
        }
      }, 500);
    },
    [handleShapeMouseOver, handleShapePress],
  );

  const switchCamera = useCallback((viewpointId) => {
    document.getElementById(viewpointId).setAttribute('set_bind', 'true');
  }, []);

  const switchBrush = useCallback(() => {
    deselectTargetTexture();
  }, [deselectTargetTexture]);

  const switchWood = useCallback((woodType) => {
    let textureURL = '';
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
    // Deselect the target element
    deselectTargetTexture();
    // Deselect the target texture
    setSelectedTexture(textureURL);
  }, []);

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
    elemRef ? setCurrentElement(elemRef) : null;

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

    x3DLoad().then((x3d) => {
      parseShapes();
      insertTextures();
      x3dom !== undefined && x3dom !== null ? x3dom.reload() : null;
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
          <div className={styles.control} onClick={() => onNextPrev()}>
            Next
          </div>
        </div>
      </div>
      <Woods
        handleWoodPress={switchWood}
        handleBrushPress={switchBrush}
        selectedTexture={selectedTexture}
      ></Woods>
      <div className={styles.visualizerWrapper}>
        <x3d is="x3d" ref={elemRef}>
          <scene is="x3d" id="container_scene">
            <inline
              is="x3d"
              id="inline_scene"
              nameSpaceName="balusterScene"
              mapDEFToID="true"
              url="https://prismic-io.s3.amazonaws.com/compleat/bb7ae962-0427-48a2-9f2c-e9a1b91982d5_3dcurve.x3d"
            ></inline>
          </scene>
        </x3d>
      </div>
    </>
  );
}
