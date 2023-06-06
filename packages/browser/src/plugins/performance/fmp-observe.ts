import { BrowserPerformanceTypes, MonitorClassTypes } from '@qmonitor/enums';
import { BasePluginType } from '@qmonitor/types';
import { get_page_url, on_load, _global } from '@qmonitor/utils';
import { BrowserClient } from '../../browser-client';
import { ReportPerformanceData } from '../../types';
import { is_lcp_done } from './lcp-observe';

let _isOnLoaded = false;
on_load(_global, () => {
    _isOnLoaded = true;
});
let _observer;
const _entries = [];

const fmpPlugin: BasePluginType<BrowserPerformanceTypes, BrowserClient> = {
    name: BrowserPerformanceTypes.FMP,
    type: MonitorClassTypes.performance,
    monitor(notify) {
        if (!MutationObserver) return;

        const _next = window.requestAnimationFrame ? requestAnimationFrame : setTimeout; // 不影响正常性能
        const _ignoreDomList = ['STYLE', 'SCRIPT', 'LINK', 'META'];
        _observer = new MutationObserver(records => { // 监听 dom 元素
            check_dom_change(notify);
            const _entry = {
                startTime: 0,
                children: []
            };

            _next(() => {
                _entry.startTime = performance.now();
            });

            for (const record of records) {
                if (record.addedNodes.length) {
                    for (const node of [...record.addedNodes]) {
                        if (node.nodeType === 1 && !_ignoreDomList.includes((node as any).tagName) && !is_include(node, _entry.children)) {
                            _entry.children.push(node);
                        }
                    }
                }
            }

            if (_entry.children.length) {
                _entries.push(_entry);
            }
        });
        _observer.observe(document, {
            childList: true,
            subtree: true
        });
    },
    transform(reportData:ReportPerformanceData) {
        return reportData;
    },
    consumer(reportData:ReportPerformanceData) {
        this.report.send(reportData);
    }
};

let _time = null;

// 反复递归,知道符合条件上传
function check_dom_change(notify) {
    clearTimeout(_time);
    _time = setTimeout(() => {
        if (is_lcp_done() && _isOnLoaded) {
            _observer && _observer.disconnect();
            const _reportData = {
                type:MonitorClassTypes.performance,
                subType: BrowserPerformanceTypes.FMP,
                pageURL: get_page_url(),
                mainData: {
                    startTime: get_render_time()
                }
            };
            notify(BrowserPerformanceTypes.FMP, _reportData);
        } else {
            check_dom_change(notify);
        }
    }, 500);
}

// 获得最后的时间
function get_render_time() {
    let _startTime = 0;
    _entries.forEach(entry => {
        for (const node of entry.children) {
            if (is_in_screen(node) && entry.startTime > _startTime && need_to_count(node)) {
                _startTime = entry.startTime;
                break;
            }
        }
    });

    // 需要和当前页面所有加载图片的时间做对比，取最大值
    // 图片请求时间要小于 startTime，响应结束时间要大于 startTime
    performance.getEntriesByType('resource').forEach((item:any) => {
        if (
            item.initiatorType === 'img' &&
            item.fetchStart < _startTime &&
            item.responseEnd > _startTime
        ) {
            _startTime = item.responseEnd;
        }
    });

    return _startTime;
}

// node节点是否已经被记录
function is_include(node, arr) {
    if (!node || node === document.documentElement) {
        return false;
    }
    if (arr.includes(node)) {
        return true;
    }
    return is_include(node.parentElement, arr);
}

// dom 对象是否在屏幕内
function is_in_screen(dom) {
    const _viewportWidth = window.innerWidth;
    const _viewportHeight = window.innerHeight;
    const _rectInfo = dom.getBoundingClientRect();
    return (_rectInfo.left >= 0 && _rectInfo.left < _viewportWidth && _rectInfo.top >= 0 && _rectInfo.top < _viewportHeight);
}

function need_to_count(node) {
    // 隐藏的元素不用计算
    if (window.getComputedStyle(node).display === 'none') return false;

    // 用于统计的图片不用计算
    if (node.tagName === 'IMG' && node.width < 2 && node.height < 2) {
        return false;
    }

    return true;
}

export default fmpPlugin;
