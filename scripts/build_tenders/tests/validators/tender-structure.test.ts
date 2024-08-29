import {
  validateTenders,
  checkTenderFiles,
  isValidTenderName,
  checkGeokeyVersions
} from '../../src/lib/validators/tender-structure';
import * as fs from 'fs';

jest.mock('fs');

describe('Tender file validation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidTenderName', () => {
    it('should return true for valid date strings', () => {
      expect(isValidTenderName('20240101')).toBe(true);
      expect(isValidTenderName('19990228')).toBe(true);
    });

    it('should return false for invalid date strings', () => {
      expect(isValidTenderName('2024-01-01')).toBe(false);
      expect(isValidTenderName('abcdefgh')).toBe(false);
      expect(isValidTenderName('202401')).toBe(false);
    });
  });

  describe('checkTenderFiles', () => {
    it('should not throw error when all required files are present', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'Tender.csv',
        'TenderCosts.csv',
        'Geokey.csv',
        'DeliveryDriver.csv',
        'Geokey_v2.csv',
      ]);

      expect(() => checkTenderFiles('/fake/path')).not.toThrow();
    });

    it('should throw error when a required file is missing', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'Tender.csv',
        'TenderCosts.csv',
        'Geokey.csv',
      ]);

      expect(() => checkTenderFiles('/fake/path')).toThrow(
        'The file DeliveryDriver.csv is missing in directory /fake/path'
      );
    });

    it('should log error for untracked CSV files', () => {
      console.error = jest.fn();
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'Tender.csv',
        'TenderCosts.csv',
        'Geokey.csv',
        'DeliveryDriver.csv',
        'UnexpectedFile.csv',
      ]);

      checkTenderFiles('/fake/path');
      expect(console.error).toHaveBeenCalledWith(
        'Not required CSV files: UnexpectedFile.csv'
      );
    });
  });

  describe('checkGeokeyVersions', () => {
    it('should not log errors for correct Geokey versions', () => {
      console.error = jest.fn();
      const files = [
        'Geokey.csv',
        'Geokey_v2.csv',
        'Geokey_v3.csv',
        'Geokey_v4.csv',
      ];

      checkGeokeyVersions(files);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should log errors for incorrect Geokey versions', () => {
      console.error = jest.fn();
      const files = [
        'Geokey.csv',
        'Geokey_v2.csv',
        'Geokey_v4.csv', // Missing v3
        'Geokey_v5.csv',
      ];

      checkGeokeyVersions(files);
      expect(console.error).toHaveBeenCalledWith(
        'Expected Geokey version Geokey_v3.csv found Geokey_v4.csv'
      );
    });
  });

  describe('validateTenders', () => {
    it('should log error when directory does not exist', () => {
      console.error = jest.fn();
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      validateTenders('/non/existent/path');
      expect(console.error).toHaveBeenCalledWith('The directory /non/existent/path does not exist.');
    });

    it('should check tender files for valid subdirectories', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValueOnce(['20240101', '20240102', 'invalid'])
        .mockReturnValueOnce(['Tender.csv', 'TenderCosts.csv', 'Geokey.csv', 'DeliveryDriver.csv'])
        .mockReturnValueOnce(['Tender.csv', 'TenderCosts.csv', 'Geokey.csv', 'DeliveryDriver.csv']);
      (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => true });

      const spy = jest.spyOn(console, 'log');
      validateTenders('/fake/path');
      expect(spy).toHaveBeenCalledWith('The project structure is valid.');
      spy.mockRestore();
    });

    it('should log success message when structure is valid', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValueOnce(['20240101'])
        .mockReturnValueOnce(['Tender.csv', 'TenderCosts.csv', 'Geokey.csv', 'DeliveryDriver.csv']);
      (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => true });

      const spy = jest.spyOn(console, 'log');
      validateTenders('/fake/path');
      expect(spy).toHaveBeenCalledWith('The project structure is valid.');
      spy.mockRestore();
    });
  });
});
