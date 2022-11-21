import React from 'react'
import { PrismicRichText } from '@prismicio/react'

/**
 * @typedef {import("@prismicio/client").Content.AboutTextSlice} AboutTextSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<AboutTextSlice>} AboutTextProps
 * @param { AboutTextProps }
 */
const AboutText = ({ slice }) => (
  <section>
    <span className="title">
      {slice.primary.title ? (
        <PrismicRichText field={slice.primary.title} />
      ) : (
        <h2>Template slice, update me!</h2>
      )}
    </span>
    {slice.primary.description ? (
      <PrismicRichText field={slice.primary.description} />
    ) : (
      <p>start by editing this slice from inside Slice Machine!</p>
    )}
    <style jsx>{`
        section {
          max-width: 462px;
          margin: 60px auto 10px auto;
          text-align: center;
        }
        .title {
          color: #000000;
        }
    `}</style>
  </section>
);

export default AboutText