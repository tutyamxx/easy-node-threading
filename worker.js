/**
 *  easy-node-threading - ⚡ Run JavaScript functions or files in isolated Node.js worker threads with a single call. Simple, minimal, and modern.
 *  @version: v1.0.9
 *  @link: https://github.com/tutyamxx/easy-node-threading
 *  @license: MIT
 **/


import { parentPort, workerData, threadId } from 'node:worker_threads';

// --| Silences logs automatically if running under Jest
if (process.env.JEST_WORKER_ID) {
    console.log = () => {};
}

/**
 * Executes the task sent to this worker, either a function or a file.
 *
 * @async
 * @returns {Promise<void>}
 */
const executeTask = async () => {
    /**
     * @type {boolean} Whether to show logs in this worker
     * @type {'file'|'function'} taskType Type of task
     * @type {string} taskSource Source code string or file URL
     */
    const { showLogs = true, taskType, taskSource = '' } = workerData ?? {};

    /**
     * Helper to log messages only if showLogs is true
     * @param {string} msg The message to log
     */
    const logOnlyIfNeeded = (msg) => showLogs && console.log(`[👷 Worker #${threadId ?? 0}] ${msg}`);
    logOnlyIfNeeded('Starting task...');

    // --| Resolve the task function based on type
    let taskFunction;

    if (taskType === 'file') {
        const importedFile = await import(taskSource);

        // --| Look for default export, then 'run' export, then the module itself
        taskFunction = importedFile.default ?? importedFile.run ?? importedFile;
    } else {
        // --| Evaluate the stringified function
        taskFunction = new Function(`return (${taskSource})`)();
    }

    // --| Validate task resolution
    if (typeof taskFunction !== 'function') {
        throw new Error(`Resolved task is not a function (type: ${typeof taskFunction})`);
    }

    // --| Execute (handles both sync and async results)
    const result = await taskFunction();

    logOnlyIfNeeded('Task completed.');
    parentPort?.postMessage?.(result);
};

(async () => {
    try {
        await executeTask();
    } catch (error) {
        parentPort?.postMessage?.({
            error: error?.message ?? 'Worker execution failed',
            stack: error?.stack ?? null,
            isWorkerError: true
        });
    }
})();
