import * as prismic from '@prismicio/client';
import * as prismicNext from '@prismicio/next';
import sm from './sm.json';

/**
 * The project's Prismic repository name.
 */
export const repositoryName = prismic.getRepositoryName(sm.apiEndpoint);

// Update the routes array to match your project's route structure
/** @type {prismic.ClientConfig['routes']} **/
const routes = [
  {
    type: 'homepage',
    lang: 'en-us',
    path: '/',
  },
  {
    type: 'about',
    lang: 'en-us',
    path: '/:about',
  },
  {
    type: 'product-locator',
    lang: 'en-us',
    path: '/:product-locator',
  },
  {
    type: 'products',
    lang: 'en-us',
    path: '/:products',
  },
  {
    type: 'systems',
    lang: 'en-us',
    path: '/:systems',
  },
];

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config {prismicNext.CreateClientConfig} - Configuration for the Prismic client.
 */
export const createClient = (config = {}) => {
  const client = prismic.createClient(sm.apiEndpoint, {
    routes,
    ...config,
  });

  prismicNext.enableAutoPreviews({
    client,
    previewData: config.previewData,
    req: config.req,
  });

  return client;
};
