import { SeverityLevel } from '@qmonitor/enums';

/**
 * 异常处理
 * @param fn try中执行的函数体
 * @param errorFn 报错时执行的函数体，将err传入
 */
export function native_try_catch(fn: () => void, errorFn?: (err: any) => void): void {
    try {
        fn();
    } catch (err) {
        if (errorFn) {
            errorFn(err);
        } else {
            console.error('err', err);
        }
    }
}

export function get_error_uid(input: string): string{
    const _id = hash_code(input) + '';
    return _id;
}

/**
 * 根据字符串生成hashcode
 *
 * @export
 * @param {string} str
 * @return {*}  {number} 可为正数和负数
 */
export function hash_code(str: string): number {
    let _hash = 0;
    if (str.length == 0) return _hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        _hash = (_hash << 5) - _hash + char;
        _hash = _hash & _hash;
    }
    return _hash;
}
// 解析错误

// 正则表达式，用以解析堆栈split后得到的字符串
const FULL_MATCH =
    /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

// 限制只追溯10个
const STACKTRACE_LIMIT = 10;

// 解析每一行
export function parse_stack_line(line: string) {
    const lineMatch = line.match(FULL_MATCH);
    if (!lineMatch) return {};
    const filename = lineMatch[2];
    const functionName = lineMatch[1] || '';
    const lineno = parseInt(lineMatch[3], 10) || undefined;
    const colno = parseInt(lineMatch[4], 10) || undefined;
    return {
        filename,
        functionName,
        lineno,
        colno
    };
}

// 解析错误堆栈
export function parse_stack_frames(error:Error) {
    const { stack } = error;
    // 无 stack 时直接返回
    if (!stack) return [];
    const frames = [];
    for (const line of stack.split('\n').slice(1)) {
        const frame = parse_stack_line(line);
        if (frame) {
            frames.push(frame);
        }
    }
    return frames.slice(0, STACKTRACE_LIMIT);
}

/**
 * Converts a string-based level into a {@link Severity}.
 *
 * @param level string representation of Severity
 * @returns Severity
 */
export function SeverityFromString(level: string): SeverityLevel {
    switch (level) {
        case 'debug':
            return SeverityLevel.Debug;
        case 'info':
        case 'log':
        case 'assert':
            return SeverityLevel.Info;
        case 'warn':
        case 'warning':
            return SeverityLevel.Warning;
        case SeverityLevel.Low:
        case SeverityLevel.Normal:
        case SeverityLevel.High:
        case SeverityLevel.Critical:
        case 'error':
            return SeverityLevel.Error;
        default:
            return SeverityLevel.Else;
    }
}

