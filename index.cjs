/**
 *  easy-node-threading - ⚡ Run JavaScript functions or files in isolated Node.js worker threads with a single call. Simple, minimal, and modern.
 *  @version: v1.0.4
 *  @link: https://github.com/tutyamxx/easy-node-threading
 *  @license: MIT
 **/

// --| CommonJS wrapper for the ESM module. This allows users to `require()` the package
const { pathToFileURL } = require('node:url');
const { resolve } = require('node:path');

const threadModuleUrl = pathToFileURL(resolve(__dirname, './index.js')).href;

let threadModuleCache;

const loadThreadModule = async () => {
    if (!threadModuleCache) {
        threadModuleCache = await import(threadModuleUrl);
    }

    return threadModuleCache;
};

/**
 * Run a function or file in a separate Node.js worker thread.
 *
 * @param {Function|string} task
 * A function to execute in the worker, or a path to a JavaScript file.
 *
 * @param {Object} [workerOptions={}]
 * Optional options passed to the Node.js Worker constructor.
 *
 * @param {boolean} [showLogs=true]
 * Whether to log parent/worker messages to the console.
 *
 * @returns {Promise<any>}
 * Resolves with the result returned from the worker.
 */
const easyNodeThreading = (task, workerOptions = {}, showLogs = true) => loadThreadModule().then(threadModule => threadModule?.default(task, workerOptions, showLogs));

module.exports = easyNodeThreading;
