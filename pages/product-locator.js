import { ProductBox, ProductFooter } from '@/components/Core';
import MasonryWall from '@/components/MasonryWall';
import styles from '@/styles/ProductLocator.module.scss';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { productTests } from '../media';

const easing = [0.6, 0.5, 0.1, 1];

const fadeInUp = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: easing,
    },
  },
};

export default function ProductLocator() {

  return (
    <motion.div
      variants={fadeInUp}
      exit={{ opacity: 0 }}
      initial="initial"
      animate="animate"
    >
      <div className={styles.container}>
        <div className={styles.productLocatorHero}></div>
        <motion.div variants={fadeInUp}>
          <div className={styles.homeContentSection}>
            <div className={styles.leftMenu}>
              <div className={styles.leftMenuContent}>
                <div className={styles.filtersSection}>
                  <div className={styles.filtersSectionTitle}>Stair Series</div>
                  <div className={styles.filtersSectionSelections}>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        id="series_cb1"
                        name="series_cb1"
                      />
                      <label for="series_cb1">All</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="series_cb2"
                        name="series_cb2"
                      />
                      <label for="series_cb2">Modern</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="series_cb3"
                        name="series_cb3"
                      />
                      <label for="series_cb3">Craftsman</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="series_cb4"
                        name="series_cb4"
                      />
                      <label for="series_cb4">Colonial</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="series_cb5"
                        name="series_cb5"
                      />
                      <label for="series_cb5">Bristol</label>
                    </div>
                  </div>
                </div>
                <div className={styles.filtersSection}>
                  <div className={styles.filtersSectionTitle}>Balusters</div>
                  <div className={styles.filtersSectionSelections}>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        id="balusters_cb1"
                        name="balusters_cb1"
                      />
                      <label for="balusters_cb1">All</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="balusters_cb2"
                        name="balusters_cb2"
                      />
                      <label for="balusters_cb2">Modern</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="balusters_cb3"
                        name="balusters_cb3"
                      />
                      <label for="balusters_cb3">Craftsman</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="balusters_cb4"
                        name="balusters_cb4"
                      />
                      <label for="balusters_cb4">Colonial</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="balusters_cb5"
                        name="balusters_cb5"
                      />
                      <label for="balusters_cb5">Bristol</label>
                    </div>
                  </div>
                </div>
                <div className={styles.filtersSection}>
                  <div className={styles.filtersSectionTitle}>Newels</div>
                  <div className={styles.filtersSectionSelections}>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        id="newels_cb1"
                        name="newels_cb1"
                      />
                      <label for="newels_cb1">All</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="newels_cb2"
                        name="newels_cb2"
                      />
                      <label for="newels_cb2">Modern</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="newels_cb3"
                        name="newels_cb3"
                      />
                      <label for="newels_cb3">Craftsman</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="newels_cb4"
                        name="newels_cb4"
                      />
                      <label for="newels_cb4">Colonial</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="newels_cb5"
                        name="newels_cb5"
                      />
                      <label for="newels_cb5">Bristol</label>
                    </div>
                  </div>
                </div>
                <div className={styles.filtersSection}>
                  <div className={styles.filtersSectionTitle}>Treads</div>
                  <div className={styles.filtersSectionSelections}>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        id="treads_cb1"
                        name="treads_cb1"
                      />
                      <label for="treads_cb1">All</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="treads_cb2"
                        name="treads_cb2"
                      />
                      <label for="treads_cb2">Radius</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="treads_cb3"
                        name="treads_cb3"
                      />
                      <label for="treads_cb3">Return</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="treads_cb4"
                        name="treads_cb4"
                      />
                      <label for="treads_cb4">Bullnose</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="treads_cb5"
                        name="treads_cb5"
                      />
                      <label for="treads_cb5">Nosing</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="treads_cb6"
                        name="treads_cb6"
                      />
                      <label for="treads_cb6">Retro</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="treads_cb7"
                        name="treads_cb7"
                      />
                      <label for="treads_cb7">Riser Material</label>
                    </div>
                  </div>
                </div>
                <div className={styles.filtersSection}>
                  <div className={styles.filtersSectionTitle}>Accessories</div>
                  <div className={styles.filtersSectionSelections}>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        id="accessories_cb1"
                        name="accessories_cb1"
                      />
                      <label for="accessories_cb1">All</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="accessories_cb2"
                        name="accessories_cb2"
                      />
                      <label for="accessories_cb2">Brackets</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="accessories_cb3"
                        name="accessories_cb3"
                      />
                      <label for="accessories_cb3">Rosettes</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="accessories_cb4"
                        name="accessories_cb4"
                      />
                      <label for="accessories_cb4">Molding</label>
                    </div>
                    <div className={styles.filtersSectionRow}>
                      <input
                        type="checkbox"
                        id="accessories_cb5"
                        name="accessories_cb5"
                      />
                      <label for="accessories_cb5">Hardware</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.content}>
              <MasonryWall>
                {productTests.map((productImage, index) => (
                  <ProductBox key={index + 'pb'}>
                    <Image
                      objectFit="cover"
                      objectPosition="center"
                      src={productImage.src}
                      width={productImage.width}
                      height={productImage.height}
                      alt="card"
                    />
                    <ProductFooter>
                      <span className={styles.productTitle}>Product Title</span>
                      <span className={styles.productNumber}>
                        Product Number
                      </span>
                    </ProductFooter>
                  </ProductBox>
                ))}
              </MasonryWall>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
