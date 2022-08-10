import consoleErrorPlugin from './error/console-error';
import {jsErrorPlugin, resourceErrorPlugin} from './error/js-error';
import promiseErrorPlugin from './error/promise-error';
import { xhrPlugin, fetchPlugin } from './performance/api-observe';
import clsPlugin from './performance/cls-observe';
import fidPlugin from './performance/fid-observe';
import fmpPlugin from './performance/fmp-observe';
import fpPlugin from './performance/paint-observe';
import lcpPlugin from './performance/lcp-observe';
import { resourcePlugin, navigationPlugin } from './performance/resource-observe';

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
    navigationPlugin
};
