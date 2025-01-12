import type { NuxtApp } from 'nuxt/app';
import {
  useAsyncData,
  useFetch,
  useLazyAsyncData,
  useLazyFetch,
} from 'nuxt/app';

import type { Client, Config } from './types';
import {
  buildUrl,
  createConfig,
  mergeConfigs,
  mergeHeaders,
  setAuthParams,
} from './utils';

export const createClient = (config: Config = {}): Client => {
  let _config = mergeConfigs(createConfig(), config);

  const getConfig = (): Config => ({ ..._config });

  const setConfig = (config: Config): Config => {
    _config = mergeConfigs(_config, config);
    return getConfig();
  };

  const request: Client['request'] = ({
    asyncDataOptions,
    composable,
    key,
    ...options
  }) => {
    const opts = {
      ..._config,
      ...options,
      $fetch: options.$fetch ?? _config.$fetch ?? $fetch,
      headers: mergeHeaders(_config.headers, options.headers),
    };

    const { security } = opts;
    if (security) {
      // auth must happen in interceptors otherwise we'd need to require
      // asyncContext enabled
      // https://nuxt.com/docs/guide/going-further/experimental-features#asynccontext
      opts.onRequest = async ({ options }) => {
        await setAuthParams({
          auth: opts.auth,
          headers: options.headers,
          query: options.query,
          security,
        });
      };
    }

    if (opts.body && opts.bodySerializer) {
      opts.body = opts.bodySerializer(opts.body);
    }

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (!opts.body) {
      opts.headers.delete('Content-Type');
    }

    const url = buildUrl(opts);

    const fetchFn = opts.$fetch;

    // if (parseAs === 'json') {
    //   if (opts.responseValidator) {
    //     await opts.responseValidator(data);
    //   }

    //   if (opts.responseTransformer) {
    //     data = await opts.responseTransformer(data);
    //   }
    // }

    if (composable === '$fetch') {
      // @ts-expect-error
      return fetchFn(url, opts);
    }

    if (composable === 'useFetch') {
      return useFetch(url, opts);
    }

    if (composable === 'useLazyFetch') {
      return useLazyFetch(url, opts);
    }

    const handler: (ctx?: NuxtApp) => Promise<any> = () =>
      // @ts-expect-error
      fetchFn(url, opts);

    if (composable === 'useAsyncData') {
      return key
        ? useAsyncData(key, handler, asyncDataOptions)
        : useAsyncData(handler, asyncDataOptions);
    }

    if (composable === 'useLazyAsyncData') {
      return key
        ? useLazyAsyncData(key, handler, asyncDataOptions)
        : useLazyAsyncData(handler, asyncDataOptions);
    }

    return undefined as any;
  };

  return {
    buildUrl,
    connect: (options) => request({ ...options, method: 'CONNECT' }),
    delete: (options) => request({ ...options, method: 'DELETE' }),
    get: (options) => request({ ...options, method: 'GET' }),
    getConfig,
    head: (options) => request({ ...options, method: 'HEAD' }),
    options: (options) => request({ ...options, method: 'OPTIONS' }),
    patch: (options) => request({ ...options, method: 'PATCH' }),
    post: (options) => request({ ...options, method: 'POST' }),
    put: (options) => request({ ...options, method: 'PUT' }),
    request,
    setConfig,
    trace: (options) => request({ ...options, method: 'TRACE' }),
  };
};

export type {
  Auth,
  Client,
  Composable,
  Config,
  Options,
  OptionsLegacyParser,
  RequestOptions,
  RequestResult,
} from './types';
export {
  createConfig,
  formDataBodySerializer,
  jsonBodySerializer,
  type QuerySerializerOptions,
  urlSearchParamsBodySerializer,
} from './utils';
