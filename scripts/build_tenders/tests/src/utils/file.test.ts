import * as fs from 'fs';
import * as path from 'path';
import { DynamoDbTender } from '../../../src/lib/builder';
import { DynamoTables } from '../../../src/utils/enum';
import AdmZip from 'adm-zip';
import {
  readDir,
  isDir,
  existPath,
  createDir,
  deleteDir,
  writeDynamoDbTenderFile,
  zipDir,
  saveJsonlToFile,
} from '../../../src/utils/file'; // Assicurati che il percorso sia corretto

jest.mock('fs');
jest.mock('adm-zip');

const mockedFs = fs as jest.Mocked<typeof fs>;
describe('File Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('readDir should return list of filenames', () => {
    // Arrange
    const dirPath = '/some/dir';
    const filenames = ['file1.txt', 'file2.txt'];
    mockedFs.readdirSync.mockReturnValue(filenames as []);

    // Act
    const result = readDir(dirPath);

    // Assert
    expect(result).toEqual(filenames);
    expect(mockedFs.readdirSync).toHaveBeenCalledWith(dirPath);
  });

  test('isDir should return true if path is a directory', () => {
    // Arrange
    const dirPath = '/some/dir';
    mockedFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);

    // Act Assert
    expect(isDir(dirPath)).toBe(true);
    expect(mockedFs.statSync).toHaveBeenCalledWith(dirPath);
  });

  test('isDir should return false if path is not a directory', () => {
    // Arrange
    const dirPath = '/some/dir';
    mockedFs.statSync.mockReturnValue({ isDirectory: () => false } as fs.Stats);

    // Act Assert
    expect(isDir(dirPath)).toBe(false);
    expect(mockedFs.statSync).toHaveBeenCalledWith(dirPath);
  });

  test('existPath should return true if path exists', () => {
    // Arrange
    const filePath = '/some/path';
    mockedFs.existsSync.mockReturnValue(true);

    // Act Assert
    expect(existPath(filePath)).toBe(true);
    expect(mockedFs.existsSync).toHaveBeenCalledWith(filePath);
  });

  test('existPath should return false if path does not exist', () => {
    // Arrange
    const filePath = '/some/path';
    mockedFs.existsSync.mockReturnValue(false);

    // Act Assert
    expect(existPath(filePath)).toBe(false);
    expect(mockedFs.existsSync).toHaveBeenCalledWith(filePath);
  });

  test('createDir should create a directory if it does not exist', () => {
    // Arrange
    const dirPath = '/some/dir';
    mockedFs.existsSync.mockReturnValue(false);

    // Act
    createDir(dirPath);

    // Assert
    expect(mockedFs.existsSync).toHaveBeenCalledWith(dirPath);
    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(dirPath, {
      recursive: true,
    });
  });

  test('createDir should not create a directory if it exists', () => {
    // Arrange
    const dirPath = '/some/dir';
    mockedFs.existsSync.mockReturnValue(true);

    // Act
    createDir(dirPath);

    // Assert
    expect(mockedFs.existsSync).toHaveBeenCalledWith(dirPath);
    expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
  });

  test('deleteDir should delete a directory if it exists', () => {
    // Arrange
    const dirPath = '/some/dir';
    mockedFs.existsSync.mockReturnValue(true);

    // Act
    deleteDir(dirPath);

    // Assert
    expect(mockedFs.existsSync).toHaveBeenCalledWith(dirPath);
    expect(mockedFs.rmSync).toHaveBeenCalledWith(dirPath, { recursive: true });
  });

  test('deleteDir should not delete a directory if it does not exist', () => {
    // Arrange
    const dirPath = '/some/dir';
    mockedFs.existsSync.mockReturnValue(false);

    // Act
    deleteDir(dirPath);

    // Assert
    expect(mockedFs.existsSync).toHaveBeenCalledWith(dirPath);
    expect(mockedFs.rmSync).not.toHaveBeenCalled();
  });

  test('saveJsonlToFile should write JSON Lines to a file', () => {
    // Arrange
    const filePath = '/some/file.jsonl';
    const data = [{ key: 'value' }, { key: 'value' }];

    // Act
    saveJsonlToFile(filePath, data);

    // Assert
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      filePath,
      JSON.stringify(data[0]) + '\n' + JSON.stringify(data[1]),
      'utf8'
    );
  });

  test('saveTender should save all tender related files', () => {
    // Arrange
    const tender: DynamoDbTender = {
      tender: [{ key: { S: 'value' } }],
      tenderCosts: [{ key: { S: 'value' } }],
      geokey: [{ key: { S: 'value' } }],
      deliveryDriver: [{ key: { S: 'value' } }],
      capacity: [{ key: { S: 'value' } }],
      province: [{ key: { S: 'value' } }],
    };
    const tenderId = 'tender123';
    const dir = '/some/dir';

    // Act
    writeDynamoDbTenderFile(tender, tenderId, dir);

    // Assert
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join(dir, tenderId, DynamoTables.TENDER + '.json'),
      JSON.stringify(tender.tender[0]),
      'utf8'
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join(dir, tenderId, DynamoTables.COST + '.json'),
      JSON.stringify(tender.tenderCosts[0]),
      'utf8'
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join(dir, tenderId, DynamoTables.GEOKEY + '.json'),
      JSON.stringify(tender.geokey[0]),
      'utf8'
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join(dir, tenderId, DynamoTables.DELIVERY_DRIVER + '.json'),
      JSON.stringify(tender.deliveryDriver[0]),
      'utf8'
    );
     expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join(dir, tenderId, DynamoTables.CAPACITY + '.json'),
      JSON.stringify(tender.capacity[0]),
      'utf8'
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join(dir, tenderId, DynamoTables.PROVINCE + '.json'),
      JSON.stringify(tender.province[0]),
      'utf8'
    );
  });

  test('zipDir should zip a directory', async () => {
    // Arrange
    const sourceDir = '/some/dir';
    const outputZipPath = '/some/output.zip';

    // Mock the methods on the AdmZip prototype
    const mockAddLocalFolder = jest.fn();
    const mockWriteZipPromise = jest.fn().mockResolvedValue(undefined);

    // Mock the AdmZip constructor to return an object with mocked methods
    (AdmZip as jest.MockedClass<typeof AdmZip>).mockImplementation(
      () =>
        ({
          addLocalFolder: mockAddLocalFolder,
          writeZipPromise: mockWriteZipPromise,
          // other methods if needed...
        } as unknown as AdmZip)
    );

    // Act
    await zipDir(sourceDir, outputZipPath);

    // Assert
    expect(mockAddLocalFolder).toHaveBeenCalledWith(sourceDir);
    expect(mockWriteZipPromise).toHaveBeenCalledWith(outputZipPath);
  });
});
