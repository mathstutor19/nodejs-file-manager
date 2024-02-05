import { normalizeToAbsolutePath } from '../fsFunctions.js';
import { validateCommandLine } from '../commandLineValidator.js';
import { createReadStream, createWriteStream } from 'node:fs';
import { createBrotliDecompress } from 'node:zlib';
import { assertFileDoesNotExist, assertFileExists } from '../asserts.js';
import { pipeline } from 'node:stream/promises';
import { OperationFailedError } from '../OperationFailedError.js';

export const decompress = async (executionContext, parsedCommandLine) => {
    validateCommandLine(parsedCommandLine, {requiredArguments: ['filePathToDecompress', 'filePathToCompressionResult']});

    const rawFilePath = parsedCommandLine.arguments[0];
    const resultFilePathToDecompress = normalizeToAbsolutePath(executionContext.currentDir, rawFilePath);

    try {
        await assertFileExists(resultFilePathToDecompress);

        const rawCompressionResultFilePath = parsedCommandLine.arguments[1];
        const compressionResultFilePath = normalizeToAbsolutePath(executionContext.currentDir, rawCompressionResultFilePath);

        await assertFileDoesNotExist(compressionResultFilePath);

        await pipeline(
            createReadStream(resultFilePathToDecompress),
            createBrotliDecompress(),
            createWriteStream(compressionResultFilePath)
        );
    } catch (error) {
        throw new OperationFailedError();
    }
};
