import { jest } from '@jest/globals';
import easyNodeThreading from '../index.js';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

describe('easy-node-threading', () => {
    let consoleSpy;

    beforeAll(() => consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {}));
    afterEach(() => consoleSpy?.mockRestore?.());

    test('Runs a simple function', async () => {
        const result = await easyNodeThreading(() => 1 + 2);
        expect(result).toBe(3);
    });

    test('Runs an async function', async () => {
        const result = await easyNodeThreading(async () => {
            return new Promise(resolve => setTimeout(() => resolve('done'), 50));
        });
        expect(result).toBe('done');
    });

    test('Runs a file task', async () => {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.resolve(__dirname, 'task.js');

        const result = await easyNodeThreading(filePath);
        expect(result).toBe(42);
    });

    test('Runs a file task with async default export', async () => {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.resolve(__dirname, 'task.js');

        const result = await easyNodeThreading(filePath);
        expect(result).toBe(42);
    });

    test('Throws when the worker task fails', async () => {
        await expect(easyNodeThreading(() => { throw new Error('fail'); })).rejects.toThrow('fail');
    });

    test('Throws when async worker fails', async () => {
        await expect(easyNodeThreading(async () => { throw new Error('async fail'); })).rejects.toThrow('async fail');
    });

    test('Handles invalid file path', async () => {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const invalidFile = path.resolve(__dirname, 'nonexistent.js');
        const invalidUrl = pathToFileURL(invalidFile).href;

        await expect(easyNodeThreading(invalidUrl)).rejects.toThrow();
    });

    test('Logs messages when showLogs is true', async () => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const result = await easyNodeThreading(() => 'logging test', {}, true);

        expect(result).toBe('logging test');
        expect(consoleSpy).toHaveBeenCalled();
    });

    test('Does not log messages when showLogs is false', async () => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const result = await easyNodeThreading(() => 'no log', {}, false);

        expect(result).toBe('no log');
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('Can run multiple workers in parallel', async () => {
        const tasks = [
            () => 10,
            () => 20,
            async () => 30
        ];

        const results = await Promise.all(tasks.map(task => easyNodeThreading(task)));
        expect(results).toEqual([10, 20, 30]);
    });

    test('Handles long-running async task', async () => {
        const result = await easyNodeThreading(async () => {
            return new Promise(resolve => setTimeout(() => resolve('finished'), 100));
        });

        expect(result).toBe('finished');
    });

    test('Returns correct values for different return types', async () => {
        const results = await Promise.all([
            easyNodeThreading(() => 123),
            easyNodeThreading(() => 'abc'),
            easyNodeThreading(() => ({ key: 'value' })),
            easyNodeThreading(() => [1, 2, 3])
        ]);

        expect(results).toEqual([123, 'abc', { key: 'value' }, [1, 2, 3]]);
    });

    test('Handles undefined task return', async () => {
        const result = await easyNodeThreading(() => {});
        expect(result).toBeUndefined();
    });

    test('Handles null task return', async () => {
        const result = await easyNodeThreading(() => null);
        expect(result).toBeNull();
    });

    test('Supports workerOptions', async () => {
        const result = await easyNodeThreading(() => 1, { resourceLimits: { maxOldGenerationSizeMb: 16 } });
        expect(result).toBe(1);
    });

    test('Can run the same worker multiple times', async () => {
        const results = await Promise.all([
            easyNodeThreading(() => 1),
            easyNodeThreading(() => 2),
            easyNodeThreading(() => 3)
        ]);
        expect(results).toEqual([1, 2, 3]);
    });

    test('Should reject if task is missing or invalid', async () => {
        await expect(easyNodeThreading()).rejects.toThrow();
        await expect(easyNodeThreading(null)).rejects.toThrow();
        await expect(easyNodeThreading('')).rejects.toThrow();
    });
});
