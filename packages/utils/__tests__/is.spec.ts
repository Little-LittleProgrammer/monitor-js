import { _global } from '../src/global';
import { isArray, isDate, isDef, isEmpty, isFunction, isObject, isUnDef, isWindow } from '../src/is';

describe('is.ts', () => {
    it('判断必须正确', () => {
        expect(isWindow(_global)).toBeTruthy();
        expect(isDef('1')).toBeTruthy();
        expect(isUnDef('1')).toBeFalsy();
        expect(isObject({})).toBeTruthy();

        expect(isEmpty('')).toBeTruthy();
        expect(isEmpty({})).toBeTruthy();
        expect(isEmpty(['1'])).toBeFalsy();
        expect(isEmpty({ test: 1 })).toBeFalsy();
        expect(isDate(new Date())).toBeTruthy();
        expect(isFunction(() => void 0)).toBeTruthy();
        expect(isArray([])).toBeTruthy();
    });
});
