import {
  validateTenders,
  checkTenderFiles,
  checkGeokeyVersions,
} from '../../../../src/lib/validators/tender-structure';
import * as fs from 'fs';

jest.mock('fs');

describe('Tender file validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkTenderFiles', () => {
    it('should not throw error when all required files are present', () => {
      // Arrange
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'Tender.csv',
        'TenderCosts.csv',
        'Geokey_v1.csv',
        'DeliveryDriver.csv',
        'Capacity_v1.csv',
        'Capacity_v2.csv',
        'Province.csv',
        'Geokey_v2.csv',
      ]);

      // Act Assert
      expect(() => checkTenderFiles('/fake/path')).not.toThrow();
    });

    it('should throw error when a required file is missing', () => {
      // Arrange
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'Tender.csv',
        'TenderCosts.csv',
        'Geokey_v1.csv',
      ]);

      // Act Assert
      expect(() => checkTenderFiles('/fake/path')).toThrow(
        'The file DeliveryDriver.csv is missing in directory /fake/path'
      );
    });

    it('should throw error for untracked CSV files', () => {
      // Arrange
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'Tender.csv',
        'TenderCosts.csv',
        'Geokey_v1.csv',
        'DeliveryDriver.csv',
        'UnexpectedFile.csv',
      ]);

      // Act Assert
      expect(() => checkTenderFiles('/fake/path')).toThrow(
        'Not required CSV files: UnexpectedFile.csv'
      );
    });
  });

  describe('checkGeokeyVersions', () => {
    it('should not throw errors for correct Geokey versions', () => {
      // Arrange
      const files = [
        'Geokey_v1.csv',
        'Geokey_v2.csv',
        'Geokey_v3.csv',
        'Geokey_v4.csv',
        'Geokey_v5.csv',
        'Geokey_v6.csv',
        'Geokey_v7.csv',
        'Geokey_v8.csv',
        'Geokey_v9.csv',
        'Geokey_v10.csv'
      ];

      // Act Assert
      expect(() => checkGeokeyVersions(files)).not.toThrow();
    });

    it('should throw error for incorrect Geokey versions', () => {
      console.error = jest.fn();
      const files = [
        'Geokey_v1.csv',
        'Geokey_v2.csv',
        'Geokey_v4.csv', // Missing v3
        'Geokey_v5.csv',
      ];

      // Act Assert
      expect(() => checkGeokeyVersions(files)).toThrow(
        'Expected Geokey version Geokey_v3.csv found Geokey_v4.csv'
      );
    });
  });

  describe('validateTenders', () => {
    it('should throw error when directory does not exist', () => {
      // Arrange
      const path = '/non/existent/path';

      // Act Assert
      expect(() => validateTenders(path)).toThrow(
        'The directory /non/existent/path does not exist.'
      );
    });

    it('should check tender files for valid subdirectories', () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock)
        .mockReturnValueOnce(['20240101', '20240102', 'invalid'])
        .mockReturnValueOnce([
          'Tender.csv',
          'TenderCosts.csv',
          'Geokey_v1.csv',
          'DeliveryDriver.csv',
        ])
        .mockReturnValueOnce([
          'Tender.csv',
          'TenderCosts.csv',
          'Geokey_v1.csv',
          'DeliveryDriver.csv',
        ]);
      (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => true });

      // Act Assert
      expect(() => validateTenders('/fake/path')).not.toThrow(
        'The project structure is valid.'
      );
    });

    it('should log success message when structure is valid', () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock)
        .mockReturnValueOnce(['20240101'])
        .mockReturnValueOnce([
          'Tender.csv',
          'TenderCosts.csv',
          'Geokey_v1.csv',
          'DeliveryDriver.csv',
        ]);
      (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => true });
      const spy = jest.spyOn(console, 'log');
      const path = '/fake/path';

      // Act
      expect(() => validateTenders(path)).not.toThrow();

      // Assert
      expect(spy).toHaveBeenCalledWith(`${path} structure is valid.`);
      spy.mockRestore();
    });
  });
});
