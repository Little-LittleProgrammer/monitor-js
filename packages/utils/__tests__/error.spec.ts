import { getErrorUid, nativeTryCatch, parseStackLine } from '../src/error';

describe('error.ts', () => {
    it('should nativeTryCatch func work', () => {
        const errMsg = 'unti';
        const throwErrorFunc = () => {
            throw new Error(errMsg);
        };
        nativeTryCatch(throwErrorFunc, (err: Error) => {
            expect(err.message).toBe(errMsg);
        });
    });
    it("should nativeTryCatch's two params not run under normal circumstances", () => {
        const normalFun = () => {
            const a = 1;
            a + 1 === 2;
        };
        let isRun = false;
        nativeTryCatch(normalFun, () => {
            isRun = true;
        });
        expect(isRun).toBeFalsy();
    });
    it('多个相同字符串加密后应该相同', () => {
        const _errorCode = 'haskjdhfkjlsdhfkjlasuklfgilew igbhjasdb jkhilu l2i3yr78923hrgiu2bfjh sb';
        const _cryptoCodeOne = getErrorUid(_errorCode);
        const _cryptoCodeTwo = getErrorUid(_errorCode);
        expect(_cryptoCodeOne).toBe(_cryptoCodeTwo);
    });
    it('不同字符串加密后应该不同', () => {
        const _errorCodeOne = 'haskjdhfkjlsdhfkjlasuklfgilew igbhjasdb jkhilu l2i3yr78923hrgiu2bfjh sb';
        const _errorCodeTwo = 'klsdhfkjlyo8i5 4ntkudsf kjdhoqy3498h d f23402u3904239';
        const _cryptoCodeOne = getErrorUid(_errorCodeOne);
        const _cryptoCodeTwo = getErrorUid(_errorCodeTwo);
        expect(_cryptoCodeOne).not.toBe(_cryptoCodeTwo);
    });
    it('错误分析应该正确', () => {
        const {filename, functionName, lineno, colno} = parseStackLine(' at codeError (http://localhost:8088/JS/index.html:27:11)');
        expect(lineno).toBe(27);
        expect(colno).toBe(11);
        expect(filename).toBe('http://localhost:8088/JS/index.html');
        expect(functionName).toBe('codeError');
    });
});
