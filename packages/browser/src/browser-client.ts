import { BaseClient } from '@qmonitor/core';
import { EventClassTypes, EventTypes } from '@qmonitor/enums';
import { first_str_to_uppercase, format_string } from '@qmonitor/utils';
import { BrowserOptions } from './browser-option';
import { BrowserReport } from './browser-report';
import { BrowserOptionsType } from './types';

export class BrowserClient extends BaseClient<BrowserOptionsType, EventTypes> {
    report: BrowserReport;
    options: BrowserOptionsType;
    constructor(options: BrowserOptionsType) {
        super(options);
        this.options = new BrowserOptions(options);
        this.report = new BrowserReport(options);
    }
    isPluginEnable(name: EventTypes): boolean {
        const _flag = `disabled${format_string(name)}`;
        return !this.options[_flag];
    }
    isPluginsEnable(name: EventClassTypes): boolean {
        const _flag = `disabled${first_str_to_uppercase(name)}`;
        return !this.options[_flag];
    }
}
