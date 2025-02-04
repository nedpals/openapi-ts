---
title: Configuration
description: Configure @hey-api/openapi-ts.
---

# Configuration

`@hey-api/openapi-ts` supports loading configuration from any file inside your project root folder supported by [jiti loader](https://github.com/unjs/c12?tab=readme-ov-file#-features). Below are the most common file formats.

::: code-group

```js [openapi-ts.config.ts]
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
});
```

```js [openapi-ts.config.cjs]
/** @type {import('@hey-api/openapi-ts').UserConfig} */
module.exports = {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

```js [openapi-ts.config.mjs]
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

:::

Alternatively, you can use `openapi-ts.config.js` and configure the export statement depending on your project setup.

## Input

Input is the first thing you must define. It can be a path, URL, or a string content resolving to an OpenAPI specification. Hey API supports all valid OpenAPI versions and file formats.

::: info
If you use an HTTPS URL with a self-signed certificate in development, you will need to set [`NODE_TLS_REJECT_UNAUTHORIZED=0`](https://github.com/hey-api/openapi-ts/issues/276#issuecomment-2043143501) in your environment.
:::

## Output

Output is the next thing to define. It can be either a string pointing to the destination folder or a configuration object containing the destination folder path and optional settings (these are described below).

::: tip
You should treat the output folder as a dependency. Do not directly modify its contents as your changes might be erased when you run `@hey-api/openapi-ts` again.
:::

## Client

Clients are responsible for sending the actual HTTP requests. The `client` value is not required, but you must define it if you're generating SDKs (enabled by default).

You can learn more on the [Clients](/openapi-ts/clients) page.

<!--
TODO: uncomment after c12 supports multiple configs
see https://github.com/unjs/c12/issues/92
-->
<!-- ### Multiple Clients

If you want to generate multiple clients with a single `openapi-ts` command, you can provide an array of configuration objects.

```js
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig([
  {
    client: 'legacy/fetch',
    input: 'path/to/openapi_one.json',
    output: 'src/client_one',
  },
  {
    client: 'legacy/axios',
    input: 'path/to/openapi_two.json',
    output: 'src/client_two',
  },
])
``` -->

## Plugins

Plugins are responsible for generating artifacts from your input. By default, Hey API will generate TypeScript interfaces and SDK from your OpenAPI specification. You can add, remove, or customize any of the plugins. In fact, we highly encourage you to do so!

You can learn more on the [Output](/openapi-ts/output) page.

## Formatting

To format your output folder contents, set `output.format` to a valid formatter.

::: code-group

```js [disabled]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    format: false, // [!code ++]
    path: 'src/client',
  },
};
```

```js [prettier]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    format: 'prettier', // [!code ++]
    path: 'src/client',
  },
};
```

```js [biome]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    format: 'biome', // [!code ++]
    path: 'src/client',
  },
};
```

:::

You can also prevent your output from being formatted by adding your output path to the formatter's ignore file.

## Linting

To lint your output folder contents, set `output.lint` to a valid linter.

::: code-group

```js [disabled]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    lint: false, // [!code ++]
    path: 'src/client',
  },
};
```

```js [eslint]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    lint: 'eslint', // [!code ++]
    path: 'src/client',
  },
};
```

```js [biome]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    lint: 'biome', // [!code ++]
    path: 'src/client',
  },
};
```

```js [oxlint]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    lint: 'oxlint', // [!code ++]
    path: 'src/client',
  },
};
```

:::

You can also prevent your output from being linted by adding your output path to the linter's ignore file.

## Filters

If you work with large specifications and want to generate output from their subset, you can use regular expressions to select the relevant definitions. Set `input.include` to match resource references to be included or `input.exclude` to match resource references to be excluded. When both regular expressions match the same definition, `input.exclude` takes precedence over `input.include`.

::: code-group

```js [include]
export default {
  client: '@hey-api/client-fetch',
  input: {
    // match only the schema named `foo` and `GET` operation for the `/api/v1/foo` path // [!code ++]
    include: '^(#/components/schemas/foo|#/paths/api/v1/foo/get)$', // [!code ++]
    path: 'path/to/openapi.json',
  },
  output: 'src/client',
};
```

```js [exclude]
export default {
  client: '@hey-api/client-fetch',
  input: {
    // match everything except for the schema named `foo` and `GET` operation for the `/api/v1/foo` path // [!code ++]
    exclude: '^(#/components/schemas/foo|#/paths/api/v1/foo/get)$', // [!code ++]
    path: 'path/to/openapi.json',
  },
  output: 'src/client',
};
```

:::

## Watch Mode

::: warning
Watch mode currently supports only remote files via URL.
:::

If your schema changes frequently, you may want to automatically regenerate the output during development. To watch your input file for changes, enable `watch` mode in your configuration or pass the `--watch` flag to the CLI.

::: code-group

```js [config]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  watch: true, // [!code ++]
};
```

```sh [cli]
npx @hey-api/openapi-ts \
  -c @hey-api/client-fetch \
  -i path/to/openapi.json \
  -o src/client \
  -w  # [!code ++]
```

:::

## Custom Files

By default, you can't keep custom files in the `output.path` folder because it's emptied on every run. If you're sure you need to disable this behavior, set `output.clean` to `false`.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    clean: false, // [!code ++]
    path: 'src/client',
  },
};
```

::: warning
Setting `output.clean` to `false` may result in broken output. Ensure you typecheck your code.
:::

## Config API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/types/config.ts) interface.

<!--@include: ../examples.md-->
<!--@include: ../sponsors.md-->
