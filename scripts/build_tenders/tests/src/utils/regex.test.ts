import {
  tenderNamePattern,
  tenderPattern,
  tenderCostsPattern,
  deliveryDriverPattern,
  geokeyFileVersionPattern,
  rangeColumnPattern,
  lastDirPattern,
  capacityFileVersionPattern,
} from '../../../src/utils/regex';

describe('Regular Expression Patterns', () => {
  test('tenderNamePattern should match valid tender names', () => {
    expect(tenderNamePattern.test('20230829')).toBe(true);
    expect(tenderNamePattern.test('19991231')).toBe(true);
    expect(tenderNamePattern.test('2023-08-29')).toBe(false);
    expect(tenderNamePattern.test('202308')).toBe(false);
    expect(tenderNamePattern.test('202308299')).toBe(false);
  });

  test('tenderPattern should match files ending with Tender.csv', () => {
    expect(tenderPattern.test('./Tender.csv')).toBe(true);
    expect(tenderPattern.test('./test/Tender.csv')).toBe(true);
    expect(tenderPattern.test('./Tender.txt')).toBe(false);
    expect(tenderPattern.test('./test/TenderCosts.csv')).toBe(false);
  });

  test('tenderCostsPattern should match files ending with TenderCosts.csv', () => {
    expect(tenderCostsPattern.test('./TenderCosts.csv')).toBe(true);
    expect(tenderCostsPattern.test('./test/TenderCosts.csv')).toBe(true);
    expect(tenderCostsPattern.test('./Tender.csv')).toBe(false);
    expect(tenderCostsPattern.test('./test/DeliveryDriver.csv')).toBe(false);
  });

  test('deliveryDriverPattern should match files ending with DeliveryDriver.csv', () => {
    expect(deliveryDriverPattern.test('MyDeliveryDriver.csv')).toBe(true);
    expect(deliveryDriverPattern.test('AnotherDeliveryDriver.csv')).toBe(true);
    expect(deliveryDriverPattern.test('SomeOtherFile.csv')).toBe(false);
    expect(deliveryDriverPattern.test('MyDeliveryDriver.txt')).toBe(false);
  });

  test('geokeyFileVersionPattern should match Geokey version files', () => {
    expect(geokeyFileVersionPattern.test('./test/Geokey_v2.csv')).toBe(true);
    expect(geokeyFileVersionPattern.test('Geokey_v2.csv')).toBe(true);
    expect(geokeyFileVersionPattern.test('Geokey_v3.csv')).toBe(true);
    expect(geokeyFileVersionPattern.test('Geokey_v10.csv')).toBe(true);
    expect(geokeyFileVersionPattern.test('Geokey.csv')).toBe(false);
    expect(geokeyFileVersionPattern.test('Geokey_v1a.csv')).toBe(false);
  });

    test('capacityFileVersionPattern should match Capacity version files', () => {
      expect(capacityFileVersionPattern.test('./test/Capacity_v2.csv')).toBe(true);
      expect(capacityFileVersionPattern.test('Capacity_v2.csv')).toBe(true);
      expect(capacityFileVersionPattern.test('Capacity_v3.csv')).toBe(true);
      expect(capacityFileVersionPattern.test('Capacity_v10.csv')).toBe(true);
      expect(capacityFileVersionPattern.test('Capacity.csv')).toBe(false);
      expect(capacityFileVersionPattern.test('Capacity_v1a.csv')).toBe(false);
    });

  test('rangeColumnPattern should match range columns', () => {
    expect(rangeColumnPattern.test('range_1_10')).toBe(true);
    expect(rangeColumnPattern.test('range_5_15')).toBe(true);
    expect(rangeColumnPattern.test('range_10_10')).toBe(true);
    expect(rangeColumnPattern.test('range_10_')).toBe(false);
    expect(rangeColumnPattern.test('range_10_10_20')).toBe(false);
  });

  test('lastDirPattern should match the last directory name', () => {
    // Arrange
    const testCases = [
      { path: '/home/user/project', expected: 'project' },
      { path: 'project', expected: 'project' },
      { path: '/home/user/', expected: null },
      { path: '/home/user', expected: 'user' },
    ];

    // Act
    testCases.forEach(({ path, expected }) => {
      const result = path.match(lastDirPattern);

      // Assert
      if (expected) {
        expect(result).not.toBeNull();
        expect(result![0]).toBe(expected);
      } else {
        expect(result).toBeNull();
      }
    });
  });
});
