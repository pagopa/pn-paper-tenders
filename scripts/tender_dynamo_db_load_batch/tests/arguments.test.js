const {
  templateArgs,
  templateOptions,
  templateEnv,
} = require('../src/config/arguments');

describe('config/arguments', () => {
  it('declares the expected mandatory arguments', () => {
    const mandatory = templateArgs
      .filter((a) => a.mandatory)
      .map((a) => a.name)
      .sort();

    expect(mandatory).toEqual(
      ['artifact', 'bucket', 'cicdProfile', 'coreProfile', 'env'].sort()
    );
  });

  it('declares fullImport and local as optional', () => {
    const optional = templateArgs
      .filter((a) => !a.mandatory)
      .map((a) => a.name);

    expect(optional).toEqual(expect.arrayContaining(['fullImport', 'local']));
  });

  it('exposes a parseArgs-compatible options object for every argument', () => {
    for (const arg of templateArgs) {
      expect(templateOptions.options).toHaveProperty(arg.name);
      expect(templateOptions.options[arg.name]).toHaveProperty('type');
    }
  });

  it('defines the allowed environments', () => {
    expect(templateEnv).toEqual(['dev', 'test', 'uat', 'hotfix', 'prod']);
  });
});
