import React, { useCallback, useState } from 'react';

const usePrismicSlides = () => {
  const outputImageURL = useCallback((pageSlices, sliceType, sliceName) => {
    let imageAr = [];
    for (let i in pageSlices) {
      if (
        pageSlices[i].primary[sliceName] !== undefined &&
        pageSlices[i].primary[sliceName]?.url !== undefined
      ) {
        imageAr.push(pageSlices[i]);
      }
    }
    return `url(${imageAr[0].primary[sliceName]?.url})`;
  }, []);

  const outputTextSlices = useCallback((pageSlices, sliceType) => {
    const targetTextSlice = sliceType;
    let textAr = [];
    for (let i in pageSlices) {
      if (pageSlices[i].slice_type === targetTextSlice) {
        textAr.push(pageSlices[i]);
      }
    }
    return textAr;
  }, []);

  return { outputImageURL, outputTextSlices };
};

export default usePrismicSlides;
