'use strict';

if (process.env.NODE_ENV === 'production') {
    module.exports = require('./dist/vue.cjs.min.js');
} else {
    module.exports = require('./dist/vue.cjs.js');
}
