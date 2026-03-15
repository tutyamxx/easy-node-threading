/**
 *  easy-node-threading - ⚡ Run JavaScript functions or files in isolated Node.js worker threads with a single call. Simple, minimal, and modern.
 *  @version: v1.0.8
 *  @link: https://github.com/tutyamxx/easy-node-threading
 *  @license: MIT
 **/

// --| CommonJS wrapper for the ESM module. This allows users to `require()` the package
const { pathToFileURL } = require('node:url');
const { resolve } = require('node:path');

const threadModuleUrl = pathToFileURL(resolve(__dirname, './index.js')).href;

let threadModuleCache;
const loadThreadModule = async () => threadModuleCache ||= await import(threadModuleUrl);

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
const easyNodeThreading = async (task, workerOptions = {}, showLogs = true) => {
    return loadThreadModule().then(threadModule => {
        return threadModule?.default(task, workerOptions, showLogs);
    });
};

module.exports = easyNodeThreading;
