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
  margin: 20px 0 0 24px;
`;

export const CalloutCardButton = styled.button`
  /* Adapt the colors based on primary prop */
  background: ${(props) => (props.primary ? '#535353' : 'grey')};
  font-size: 14px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-family: 'EB Garamond', serif;
  height: 30px;
  border: 0;
  border-radius: 0;
  width: 135px;
  min-height: 32px;
  max-height: 32px;
  margin: 10px 0 0 0;
`;

export const CarouselNextButton = styled.button`
  background: ${(props) => (props.primary ? '#535353' : 'grey')};
  font-size: 14px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-family: 'EB Garamond', serif;
  height: 30px;
  border: 0;
  border-radius: 0;
  width: 135px;
  min-height: 32px;
  max-height: 32px;
  margin: 0 0 0 10px;
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
  min-height: 32px;
  max-height: 32px;
  margin: 0 10px 0 10px;
`;

export const CarouselSmallButton = styled.button`
  background: ${(props) =>
    props.primary ? 'rgba(162, 162, 162, 0.4)' : 'rgba(162, 162, 162, 0.4)'};
  cursor: pointer;
  height: 30px;
  border: 0;
  border-radius: 4px;
  width: 30px;
  min-height: 8px;
  max-height: 8px;
  margin: 0 5px 8px 5px;
`;
