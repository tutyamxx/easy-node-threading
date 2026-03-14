import { parentPort, workerData, threadId } from 'node:worker_threads';

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
    logOnlyIfNeeded("Starting task...");

    // --| Resolve the task function based on type
    const taskFunction = taskType === 'file'
        ? (await import(taskSource)).default ?? (await import(taskSource)).run
        : new Function(`return (${taskSource})`)();

    // --| Execute (with a fallback to a no-op if resolution failed)
    const result = await (taskFunction ?? (() => null))();

    logOnlyIfNeeded("Task completed.");
    parentPort?.postMessage?.(result);
};

(async () => {
    try {
        await executeTask();
    } catch (error) {
        parentPort?.postMessage?.({
            error: error?.message ?? 'Worker execution failed',
            stack: error?.stack ?? null
        });
    }
})();
