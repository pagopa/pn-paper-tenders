const { validate } = require('../src/utils/argumentsValidator');
const { templateArgs, templateEnv } = require('../src/config/arguments');

/** Builds the { values } shape produced by node's util.parseArgs. */
const asValues = (values) => ({ values });

const validValues = {
  cicdProfile: 'cicd',
  coreProfile: 'core',
  env: 'dev',
  bucket: 'my-bucket',
  artifact: 'artifact.zip',
};

describe('argumentsValidator.validate', () => {
  it('returns true when all mandatory params are present and env is valid', () => {
    expect(validate(templateArgs, asValues({ ...validValues }))).toBe(true);
  });

  it.each(['cicdProfile', 'coreProfile', 'env', 'bucket', 'artifact'])(
    'returns false when mandatory param "%s" is missing',
    (missing) => {
      const values = { ...validValues };
      delete values[missing];

      expect(validate(templateArgs, asValues(values))).toBe(false);
    }
  );

  it('returns true when optional params are omitted', () => {
    // fullImport and local are optional
    expect(validate(templateArgs, asValues({ ...validValues }))).toBe(true);
  });

  it('returns false when env is not one of the allowed values', () => {
    const values = { ...validValues, env: 'staging' };

    expect(validate(templateArgs, asValues(values))).toBe(false);
  });

  it.each(templateEnv)('accepts allowed env value "%s"', (env) => {
    const values = { ...validValues, env };

    expect(validate(templateArgs, asValues(values))).toBe(true);
  });
});
