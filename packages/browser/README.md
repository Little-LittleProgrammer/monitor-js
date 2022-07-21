# `browser`

> TODO: description

## Usage

```bash
npm install @qmonitor/browser
```

```js

import { init } from '@qmonitor/browser';

init({
    url: 'http://localhost:8083/reportData',
    appName: '直客',
    appID: 'zhike',
    cacheNum: 10,
    vue: {
        Vue,
        router
    }
});
```
