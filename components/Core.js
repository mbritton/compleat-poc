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
  margin: 10px 0 0 24px;
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
