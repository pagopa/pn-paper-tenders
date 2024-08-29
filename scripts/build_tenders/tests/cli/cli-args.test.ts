import commandLineArgs from 'command-line-args';
import { processArgs, getPath, getOutFile } from '../../src/utils/cli';

jest.mock('command-line-args');

describe('Command-line argument processing', () => {
  let consoleLogSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation((code?: number | string | null | undefined) => {
        throw new Error('process.exit: ' + code);
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processArgs', () => {
    it('should error when --path flag is not present', () => {
      // Arrange
      (commandLineArgs as jest.Mock).mockReturnValue({
        help: false,
      });

      // Act Assert
      expect(() => processArgs()).toThrow('--path is required');
    });

    it('should display help and exit when --help flag is present', () => {
      // Arrange
      (commandLineArgs as jest.Mock).mockReturnValue({
        help: true,
      });

      // Act Assert
      expect(() => processArgs()).toThrow('process.exit: 0');
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should set outFile when provided', () => {
      // Arrange
      const testOutFile = 'test-output.zip';
      (commandLineArgs as jest.Mock).mockReturnValue({
        path: '/test/path',
        outFile: testOutFile,
        help: false,
      });

      // Act
      processArgs();
      const out = getOutFile();

      // Assert
      expect(out).toBeDefined();
      expect(out).toBe(testOutFile);
    });

    it('should not override provided outFile', () => {
      // Arrange
      const testOutFile = 'test-output.zip';
      (commandLineArgs as jest.Mock).mockReturnValue({
        path: '/test/path',
        outFile: testOutFile,
        help: false,
      });

      processArgs();
      const out = getOutFile();

      expect(out).toBeDefined();
      expect(out).toBe(testOutFile);
    });
  });

  describe('getPath', () => {
    it('should return the path from command-line arguments', () => {
      // Arrange
      const testPath = '/test/path';
      (commandLineArgs as jest.Mock).mockReturnValue({
        path: testPath,
        help: false,
      });

      // Act
      processArgs();
      const result = getPath();

      // Assert
      expect(result).toBe(testPath);
    });
  });

  describe('getOutFile', () => {
    it('should return the outFile from command-line arguments', () => {
      // Arrange
      const testOutFile = 'test-output.zip';
      (commandLineArgs as jest.Mock).mockReturnValue({
        path: '/test/path',
        outFile: testOutFile,
        help: false,
      });

      // Act
      processArgs();
      const result = getOutFile();

      // Assert
      expect(result).toBe(testOutFile);
    });
  });
});
