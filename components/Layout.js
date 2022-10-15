import styles from '@/styles/Layout.module.scss';
import TopNav from '@/components/TopNav';

const Layout = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.topBrand}></div>
        <TopNav></TopNav>
      </div>
      <main className={styles.main}>{children}</main>
      <div className={styles.footer}></div>
    </div>
  );
};

export default Layout;
