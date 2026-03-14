/**
 *  easy-node-threading - ⚡ Run JavaScript functions or files in isolated Node.js worker threads with a single call. Simple, minimal, and modern.
 *  @version: v1.0.0
 *  @link: https://github.com/tutyamxx/easy-node-threading
 *  @license: MIT
 **/


import { Worker } from 'node:worker_threads';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const workerScriptPath = resolve(moduleDirectory, 'worker.js');

/**
 * Attach message, error, and exit listeners to a worker.
 *
 * @param {Worker} worker Worker instance
 * @param {Function} resolvePromise Promise resolve callback
 * @param {Function} rejectPromise Promise reject callback
 * @param {boolean} showLogs Whether to log messages to console
 */
const attachWorkerListeners = (worker, resolvePromise, rejectPromise, showLogs) => {
    worker?.on?.('message', message => {
        if (showLogs) {
            console.log(`[⚙️ Parent] Received message from 👷 Worker #${worker?.threadId ?? 0}`);
        }

        if (message?.error) {
            const error = new Error(message?.error ?? 'Worker error');

            error.stack = message?.stack ?? error.stack;
            rejectPromise(error);

            return;
        }

        resolvePromise(message);
    });

    worker?.on?.('error', rejectPromise);
    worker?.on?.('exit', code => code !== 0 && rejectPromise(new Error(`Worker exited with code ${code}`)));
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
const easyNodeThreading = (task, workerOptions = {}, showLogs = true) => {
    return new Promise((resolvePromise, rejectPromise) => {
        const isFunctionTask = typeof task === 'function';

        const worker = new Worker(workerScriptPath, {
            workerData: {
                taskType: isFunctionTask ? 'function' : 'file',
                taskSource: isFunctionTask ? task?.toString?.() ?? '' : pathToFileURL(resolve(task))?.href ?? '',
                showLogs
            },

            ...workerOptions
        });

        if (showLogs) {
            console.log(`[⚙️ Parent] Spawned 👷 Worker #${worker?.threadId ?? 0}`);
        }

        attachWorkerListeners(worker, resolvePromise, rejectPromise, showLogs);
    });
};

export default easyNodeThreading;
