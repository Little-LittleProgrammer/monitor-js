import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import clear from 'rollup-plugin-clear';
import cleanup from 'rollup-plugin-cleanup';
import size from 'rollup-plugin-sizes';
import { visualizer } from 'rollup-plugin-visualizer';

const path = require('path');
const fs = require('fs');
if (!process.env.TARGET) {
    throw new Error('TARGET package must be specified');
}
// generate *.d.ts file
const isDeclaration = process.env.TYPES !== 'false';
const masterVersion = require('./package.json').version;
const author = require('./package.json').author;
const packagesDir = path.resolve(__dirname, 'packages');
const packageDir = path.resolve(packagesDir, process.env.TARGET);
const packageDirDist = process.env.LOCALDIR === 'undefined' ? `${packageDir}/dist` : process.env.LOCALDIR;
// package => file name
const name = path.basename(packageDir);
// const pathResolve = (p) => path.resolve(packageDir, p)

// major name
const M = '@qmonitor';
const packageDirs = fs.readdirSync(packagesDir);
const paths = {};
packageDirs.forEach((dir) => {
    // filter hidden files
    if (dir.startsWith('.')) return;
    paths[`${M}/${dir}`] = [`${packagesDir}/${dir}/src`];
});

const _info = `/* ${M}/${name} version: ${masterVersion} \n author: ${author} */`;
// for react
const processEnvBanner = `
  var process = {
    env: {
      NODE_ENV: 'production'
    }
  }
`;
const includeEnvNames = ['react', 'web'];
const banner = `${_info}${includeEnvNames.includes(name) ? '\n' + processEnvBanner : ''}`;

function get_common() {
    const common = {
        input: `${packageDir}/src/index.ts`,
        output: {
            banner,
            footer: '/* join us */',
            globals: {
                react: 'React',
                jsxRuntime: 'jsxRuntime'
            }
        },
        // 外部依赖，也是防止重复打包的配置
        external: [...Object.keys(paths), 'react', 'jsxRuntime'],
        plugins: [
            resolve(),
            size(),
            visualizer({
                title: `${M} analyzer`,
                filename: 'analyzer.html'
            }),
            commonjs({
                exclude: 'node_modules'
            }),
            json(),
            cleanup({
                comments: 'none'
            }),
            typescript({
                tsconfig: 'tsconfig.build.json',
                useTsconfigDeclarationDir: true,
                tsconfigOverride: {
                    compilerOptions: {
                        declaration: isDeclaration,
                        declarationMap: isDeclaration,
                        declarationDir: `${packageDirDist}/packages/`, // 类型声明文件的输出目录
                        module: 'ES2015',
                        paths
                    }
                },
                include: ['*.ts+(|x)', '**/*.ts+(|x)', '../**/*.ts+(|x)']
            })
            // remove console.log in bundle
            // strip({
            //   include: ['**/*.(js|ts|tsx)'],
            //   functions: ['console.log']
            // })
        ]
    };
    return common;
}

const FormatTypes = {
    esm: 'es',
    cjs: 'cjs',
    iife: 'iife'
};

const common = get_common();

const esmPackage = {
    ...common,
    output: {
        file: `${packageDirDist}/${name}.esm.js`,
        format: FormatTypes.esm,
        sourcemap: false,
        ...common.output
    },
    plugins: [
        ...common.plugins,
        clear({
            targets: [packageDirDist]
        })
    ]
};
const esmPackageMin = {
    ...common,
    output: {
        file: `${packageDirDist}/${name}.esm.min.js`,
        format: FormatTypes.esm,
        sourcemap: false,
        ...common.output
    },
    plugins: [
        ...common.plugins,
        clear({
            targets: [packageDirDist]
        }),
        terser()
    ]
};
const cjsPackage = {
    ...common,
    external: [],
    output: {
    // ${packageDirDist}
    // /Users/bytedance/Desktop/github/mitojs/examples/Mini/utils/
        file: `${packageDirDist}/${name}.cjs.js`,
        format: FormatTypes.cjs,
        sourcemap: false,
        minifyInternalExports: true,
        ...common.output
    },
    plugins: [...common.plugins]
};
const cjsPackageMin = {
    ...common,
    external: [],
    output: {
    // ${packageDirDist}
    // /Users/bytedance/Desktop/github/mitojs/examples/Mini/utils/
        file: `${packageDirDist}/${name}.cjs.min.js`,
        format: FormatTypes.cjs,
        sourcemap: false,
        minifyInternalExports: true,
        ...common.output
    },
    plugins: [...common.plugins, terser()]
};

const iifePackage = {
    ...common,
    external: [],
    output: {
        file: `${packageDirDist}/${name}.min.js`,
        format: FormatTypes.iife,
        name: `QMONITOR${name}`,
        ...common.output
    },
    plugins: [...common.plugins, terser()]
};
const total = {
    esmPackage,
    esmPackageMin,
    iifePackage,
    cjsPackage,
    cjsPackageMin
};
const result = total;
export default [...Object.values(result)];
