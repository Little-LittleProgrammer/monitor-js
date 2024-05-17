import { BaseClient } from '@qmonitor/core';
import { MonitorClassTypes, MonitorTypes } from '@qmonitor/enums';
import { firstStrToUppercase, formatString } from '@qmonitor/utils';
import { BrowserOptions } from './browser-option';
import { BrowserReport } from './browser-report';
import { BrowserOptionsType } from './types';

export class BrowserClient extends BaseClient<BrowserOptionsType, MonitorTypes> {
    report: BrowserReport;
    options: BrowserOptionsType;
    constructor(options: BrowserOptionsType) {
        super(options);
        this.options = new BrowserOptions(options);
        this.report = new BrowserReport(options);
    }
    isPluginEnable(name: MonitorTypes): boolean {
        const _flag = `disabled${formatString(name)}`;
        return !this.options[_flag];
    }
    isPluginsEnable(type: MonitorClassTypes): boolean {
        const _flag = `disabled${firstStrToUppercase(type)}`;
        return !this.options[_flag];
    }
}
