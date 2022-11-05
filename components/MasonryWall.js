import { Col, MasonryDiv } from '@/components/Core';
import React, { useEffect, useRef, useState } from 'react';

const useEventListener = (eventName, handler, element = window) => {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;
      const eventListener = event => savedHandler.current(event);
      element.addEventListener(eventName, eventListener);
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element]
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
