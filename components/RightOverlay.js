import styles from '@/styles/RightOverlay.module.scss';
import { useCallback, useState } from 'react';
import { BsXLg } from 'react-icons/bs';
import { RightOverlayButton } from '@/components/Core';

const RightOverlay = (props) => {
  const [isOpen, setIsOpen] = useState(true);
  const handleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);
  return (
    <div className={isOpen ? styles.rightOverlay : styles.rightOverlayClosed}>
      <div className={styles.closeIcon}>
        <BsXLg onClick={handleOpen}></BsXLg>
      </div>
      <h1>{props.title}</h1>
      <div className={styles.overlayText}>
        Sint nisi pariatur eu irure ipsum eiusmod Lorem tempor commodo dolor
        anim eiusmod incididunt magna.
      </div>
      <RightOverlayButton>Overlay Button</RightOverlayButton>
    </div>
  );
};

export default RightOverlay;
