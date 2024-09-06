const { templateEnv } = require('../config/arguments');

/**
 * Validate input parameters against arguments template to verify the presence of mandatory ones
 *
 * @param args      argument template
 * @param values    input parameter to validate against template
 *
 * @return a boolean that indicates if validation success occurs or not
 * */
function validate(args, values) {
  for (const arg of args) {
    if (arg.mandatory && !values.values[arg.name]) {
      console.log(`Param <${arg.name}> is not defined`);
      _printUsage(args);

      return false;
    }

    // Validate environment against allowed values
    if (arg.name === 'env' && !templateEnv.includes(values.values[arg.name])) {
      console.log(
        `Param <${arg.name}> must be one of these values ` +
          '[' +
          templateEnv.join(', ') +
          ']'
      );

      return false;
    }
  }

  return true;
}

/**
 * Script usage printer
 *
 * @param args  argument template
 * */
function _printUsage(args) {
  let usage = 'Usage: index.js';

  for (const arg of args) {
    usage = usage.concat(
      ' ',
      arg.mandatory
        ? `--${arg.name} <${arg.name}>`
        : `[--${arg.name} <${arg.name}>]`
    );
  }

  console.log(usage);
}

exports.validate = validate;
