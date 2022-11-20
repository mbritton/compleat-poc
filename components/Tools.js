import styles from '@/styles/Tools.module.scss';
import { BiEnvelope, BiHelpCircle } from 'react-icons/bi';

const Tools = ({ path, pageObjects }) => {
  return (
    <div className={styles.toolsWrapper}>
      <BiEnvelope />
      <BiHelpCircle />
    </div>
  );
};

export default Tools;
