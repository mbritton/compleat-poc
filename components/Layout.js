import TopNav from '@/components/TopNav';
import styles from '@/styles/Layout.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { BiChevronLeft } from 'react-icons/bi';

export default function Layout({ page, pages, children }) {
  const [pageObj] = useState(JSON.parse(pages));
  const router = useRouter();

  const handleClick = useCallback((e, path) => router.push(path), []);

  // Uncomment to see the page object and the current page
  // useEffect(() => {
  //   console.log('page', page);
  //   console.log('router.asPath', router.asPath);
  //   console.log('pageObj.pages', pageObj.pages);
  // }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.topBrand}></div>
        {router.asPath !== '/visualizer3' && (
          <TopNav
            page={page}
            path={router.asPath}
            pageObjects={pageObj.pages}
          ></TopNav>
        )}
      </div>
      <div className={styles.logoHeader}>
        {router.asPath === '/visualizer3' && (
          <Link href={'/visualizer'}>
            <div className={styles.BiChevronLeft}>
              <BiChevronLeft></BiChevronLeft>
            </div>
          </Link>
        )}
        <Image
          src={
            'https://images.prismic.io/compleat/402b4afe-3fbd-4aca-9184-e374ac5f5041_logo-black-text-sm.png'
          }
          width={287}
          height={86}
          alt="Compleat Stair"
          onClick={(e) => handleClick(e, '/')}
        />
      </div>
      <main className={styles.main}>{children}</main>
      <div className={styles.footer}></div>
    </div>
  );
}
