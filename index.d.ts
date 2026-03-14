import { WorkerOptions } from "node:worker_threads";

/**
 * Run a function or file in a separate Node.js worker thread.
 *
 * @param task
 * A function to execute in the worker, or a path to a JavaScript file.
 *
 * @param workerOptions
 * Optional options passed to the Node.js Worker constructor.
 *
 * @param showLogs
 * Whether to log parent/worker messages to the console. Defaults to true.
 *
 * @returns Resolves with the result returned from the worker.
 */
declare function easyNodeThreading<T = unknown>(task: (() => T | Promise<T>) | string, workerOptions?: WorkerOptions, showLogs?: boolean): Promise<T>;

export = easyNodeThreading;
export default easyNodeThreading;
