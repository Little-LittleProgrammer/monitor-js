import type {Config} from '@jest/types';
const config: Config.InitialOptions = {
    collectCoverage: true,
    testEnvironment: 'jsdom',
    preset: 'ts-jest',
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.json',
            diagnostics: false
        }
    },
    rootDir: __dirname, // 根路径
    testMatch: ['**/*.spec.ts'], // 设置识别哪些文件是测试文件
    moduleFileExtensions: ['js', 'ts'], // 测试文件的类型
    moduleNameMapper: {
        // alias src/(.*) not work
        // 从上到下优先匹配
        '@/test/(.*)': '<rootDir>/test/$1',
        '@qmonitor/(.*)': '<rootDir>/packages/$1/src/index'
    }
};
export default config;
