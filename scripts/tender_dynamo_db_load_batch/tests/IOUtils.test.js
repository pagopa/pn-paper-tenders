const fs = require('fs');
const os = require('os');
const path = require('path');
const { extname } = require('path');
const AdmZip = require('adm-zip');

const {
  unzip,
  readSync,
  writeSync,
  makeDirSync,
} = require('../src/utils/IOUtils');

const TENDER_ZIP = path.join(__dirname, 'resources', 'tender.zip');

/**
 * Replicates the filter used by the batch script (see src/index.js): keep only
 * JSON files belonging to the given environment, excluding macOS metadata.
 */
const envJsonFilter = (env) => (file) =>
  extname(file.path) === '.json' &&
  file.path.includes(env) &&
  !file.path.match(/^__MACOSX\//);

describe('IOUtils.unzip', () => {
  let target;

  beforeEach(() => {
    target = fs.mkdtempSync(path.join(os.tmpdir(), 'tdlb-unzip-'));
  });

  afterEach(() => {
    fs.rmSync(target, { recursive: true, force: true });
  });

  it('throws when source is empty', async () => {
    await expect(unzip('', target)).rejects.toThrow(
      'Source parameter cannot be empty, null or undefined'
    );
  });

  it('throws when target is empty', async () => {
    await expect(unzip(TENDER_ZIP, '')).rejects.toThrow(
      'Target parameter cannot be empty, null or undefined'
    );
  });

  it('extracts only JSON files of the requested environment', async () => {
    const extracted = await unzip(TENDER_ZIP, target, envJsonFilter('dev'));

    expect(Array.isArray(extracted)).toBe(true);
    expect(extracted.length).toBeGreaterThan(0);

    for (const p of extracted) {
      expect(p.endsWith('.json')).toBe(true);
      expect(p.includes('dev')).toBe(true);
      expect(p.startsWith('__MACOSX/')).toBe(false);
      // files are physically extracted preserving the relative path
      expect(fs.existsSync(path.join(target, p))).toBe(true);
    }
  });

  it('does not extract files from other environments when filtered', async () => {
    const extracted = await unzip(TENDER_ZIP, target, envJsonFilter('dev'));

    const otherEnvFiles = extracted.filter((p) =>
      /^(prod|uat|test|hotfix)\//.test(p)
    );
    expect(otherEnvFiles).toHaveLength(0);
  });

  it('extracts every regular file when no filter is provided', async () => {
    const extracted = await unzip(TENDER_ZIP, target);

    const zip = new AdmZip(TENDER_ZIP);
    const totalFiles = zip
      .getEntries()
      .filter((e) => !e.isDirectory).length;

    expect(extracted).toHaveLength(totalFiles);
  });

  it('skips entries that would escape the target folder (Zip-Slip guard)', async () => {
    const maliciousZipPath = path.join(target, 'malicious.zip');
    const zip = new AdmZip();
    zip.addFile('safe.json', Buffer.from('{}'));
    // addFile normalizes leading "../", so force a traversal entry name
    // directly to actually exercise the Zip-Slip guard.
    zip.addFile('placeholder.json', Buffer.from('{}'));
    zip.getEntries().find((e) => e.entryName === 'placeholder.json').entryName =
      '../escaped.json';
    zip.writeZip(maliciousZipPath);

    // sanity check: the crafted archive really contains the traversal path
    expect(
      new AdmZip(maliciousZipPath)
        .getEntries()
        .map((e) => e.entryName)
    ).toContain('../escaped.json');

    const extractDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tdlb-slip-'));
    try {
      const extracted = await unzip(
        maliciousZipPath,
        extractDir,
        (file) => extname(file.path) === '.json'
      );

      expect(extracted).toContain('safe.json');
      expect(extracted).not.toContain('../escaped.json');

      const escapedTarget = path.resolve(extractDir, '..', 'escaped.json');
      expect(fs.existsSync(escapedTarget)).toBe(false);
    } finally {
      fs.rmSync(extractDir, { recursive: true, force: true });
    }
  });

  it('returns undefined and does not throw on a corrupted archive', async () => {
    const badZip = path.join(target, 'not-a-zip.zip');
    fs.writeFileSync(badZip, 'this is not a zip archive');

    const result = await unzip(badZip, target);
    expect(result).toBeUndefined();
  });
});

describe('IOUtils sync file helpers', () => {
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tdlb-io-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('writeSync then readSync round-trips content', () => {
    const file = path.join(dir, 'data.json');
    const content = JSON.stringify({ hello: 'world' });

    writeSync(file, content);

    expect(fs.existsSync(file)).toBe(true);
    expect(readSync(file)).toBe(content);
  });

  it('makeDirSync creates nested directories', () => {
    const nested = path.join(dir, 'a', 'b', 'c');

    makeDirSync(nested);

    expect(fs.existsSync(nested)).toBe(true);
    expect(fs.statSync(nested).isDirectory()).toBe(true);
  });

  it('makeDirSync is a no-op when the directory already exists', () => {
    expect(() => makeDirSync(dir)).not.toThrow();
    expect(fs.existsSync(dir)).toBe(true);
  });
});
