import { RightOverlayButton } from '@/components/Core';
import styles from '@/styles/RightOverlay.module.scss';
import { BiDetail } from 'react-icons/bi';
import { BsXLg } from 'react-icons/bs';
import { useCallback, useState } from 'react';

const RightOverlay = (props) => {
  const [isOpen, setIsOpen] = useState(true);
  const handleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);
  return (
    <div className={isOpen ? styles.rightOverlay : styles.rightOverlayClosed}>
      <div className={styles.closeIcon}>
        {!isOpen ? (
          <BiDetail
            className={styles.windowIcon}
            onClick={handleOpen}
          ></BiDetail>
        ) : (
          <></>
        )}
        {isOpen ? <BsXLg onClick={handleOpen}></BsXLg> : <></>}
      </div>
      {isOpen ? (
        <>
          <h1>{props.title}</h1>
          <div className={styles.overlayText}>
            Sint nisi pariatur eu irure ipsum eiusmod Lorem tempor commodo dolor
            anim eiusmod incididunt magna.
          </div>
          <RightOverlayButton onClick={handleOpen}>
            Overlay Button
          </RightOverlayButton>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default RightOverlay;
