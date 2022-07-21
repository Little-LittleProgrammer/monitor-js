# web-monitor-sdk

## Usage

### 浏览器vue项目

```bash
npm install @qmonitor/browser
npm install @qmonitor/vue
```

```js

import { init } from '@qmonitor/browser';
import { vuePlugin } from '@qmonitor/vue';

init({
    url: 'http://localhost:8083/reportData',
    appName: '直客',
    appID: 'zhike',
    cacheNum: 10,
    vue: {
        Vue,
        router
    }
}, [vuePlugin]);
```