import styles from '@/styles/MasonryWall.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

// Move to Core.js
export const MasonryDiv = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: ${(props) => props.gap || `1em`};
`;

export const Col = styled.div`
  display: grid;
  grid-gap: ${(props) => props.gap || `1em`};
`;


const useEventListener = (eventName, handler, element = window) => {
  const savedHandler = useRef();

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;

      // Create event listener that calls handler function stored in ref
      const eventListener = event => savedHandler.current(event);

      // Add event listener
      element.addEventListener(eventName, eventListener);

      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
};
  
const fillCols = (children, cols) => {
  children.forEach((child, i) => cols[i % cols.length].push(child));
};

const MasonryWall = ({ children, gap, minWidth = 500, ...rest }) => {

  const ref = useRef();
  const [numCols, setNumCols] = useState(3);
  const cols = [...Array(numCols)].map(() => []);
  fillCols(children, cols);

  const resizeHandler = () =>
    setNumCols(Math.ceil(ref.current.offsetWidth / minWidth));
  useEffect(resizeHandler, []);
  useEventListener(`resize`, resizeHandler);

  return (
    <MasonryDiv ref={ref} gap={gap} {...rest}>
      {[...Array(numCols)].map((_, index) => (
        <Col key={index} gap={gap}>
          {cols[index]}
        </Col>
      ))}
    </MasonryDiv>
  );
};

export default MasonryWall;
