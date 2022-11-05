import styled from 'styled-components';

// Buttons

export const RightOverlayButton = styled.button`
  /* Adapt the colors based on primary prop */
  background: ${(props) => (props.primary ? '#5A0A0A' : '#5A0A0A')};
  font-size: 12px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  font-family: 'EB Garamond', serif;
  height: 30px;
  border: 0;
  text-transform: uppercase;
  border-radius: 0;
  width: 155px;
  letter-spacing: 0.75px;
  min-height: 42px;
  max-height: 42px;
  margin: 0 0 40px 24px;
`;

export const CalloutCardButton = styled.button`
  /* Adapt the colors based on primary prop */
  background: '#535353';
  font-size: 14px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-family: 'EB Garamond', serif;
  height: 30px;
  border: 0;
  border-radius: 0;
  max-width: 100%;
  min-height: 32px;
  max-height: 32px;
  margin: 0 5px 0 5px;
  // margin-top: 12px;
  // margin-left: ${(props) => (props.primary ? '10px' : '-16px')};
  // margin-right: ${(props) => (!props.primary ? '10px' : '0')};
`;

export const CarouselButton = styled.button`
  background: ${(props) => (props.primary ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0)')};
  font-size: 24px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-family: 'EB Garamond', serif;
  height: 30px;
  border: 0;
  border-radius: 0;
  width: 60px;
  max-height: 32px;
  margin: 0 10px 0 10px;
`;

export const CarouselSmallButton = styled.button`
  background: ${(props) =>
    props.primary ? 'rgba(162, 162, 162, 1)' : 'rgba(162, 162, 162, 1)'};
  cursor: pointer;
  height: 30px;
  border: 0;
  border-radius: 4px;
  width: 4px;
  max-height: 8px;
  margin: 0 5px 8px 5px;
`;

export const MasonryDiv = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: ${(props) => props.gap || `1em`};
`;

export const Col = styled.div`
  display: grid;
  grid-gap: ${(props) => props.gap || `1em`};
`;

export const ColorBox = styled.div`
  border-radius: 0;
  transition: 0.5s;
  justify-content: center;
  align-content: center;
  display: grid;
  color: black;
  cursor: pointer;
  :hover {
    transform: scale(1.06);
    box-shadow: 0 0 12px 0 ${(props) => props.theme.lightGray};
    border-radius: 12px
  }
`;
