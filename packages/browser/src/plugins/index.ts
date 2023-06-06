import consoleErrorPlugin from './error/console-error';
import {jsErrorPlugin, resourceErrorPlugin} from './error/js-error';
import promiseErrorPlugin from './error/promise-error';

import { xhrPlugin, fetchPlugin } from './error/api-error';
import clsPlugin from './performance/cls-observe';
import fidPlugin from './performance/fid-observe';
import fmpPlugin from './performance/fmp-observe';
import fpPlugin from './performance/paint-observe';
import lcpPlugin from './performance/lcp-observe';
import { resourcePlugin, navigationPlugin } from './performance/resource-observe';

import clickPlugin from './behavior/click';
import hashRoutePlugin from './behavior/hash-route';
import pvPlugin from './behavior/pv';
import historyRoutePlugin from './behavior/history-router';

export {
    consoleErrorPlugin,
    jsErrorPlugin,
    resourceErrorPlugin,
    promiseErrorPlugin,

    xhrPlugin,
    fetchPlugin,
    clsPlugin,
    fidPlugin,
    fmpPlugin,
    fpPlugin,
    lcpPlugin,
    resourcePlugin,
    navigationPlugin,

    clickPlugin,
    hashRoutePlugin,
    pvPlugin,
    historyRoutePlugin
};
