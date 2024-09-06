import commandLineArgs, { CommandLineOptions } from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { DEFAULT_OUT_FILE } from '../config';

const appDescription =
  'Used to validate the structure of tender files, verify the content of CSVs, \
and generate a JSON file that can be directly uploaded to DynamoDB for each \
specific environment.';

// Define the option definitions
const optionDefinitions = [
  {
    name: 'path',
    alias: 'p',
    type: String,
    defaultOption: true,
    description: 'The path to root pn-paper-tenders.',
  },
  {
    name: 'outFile',
    alias: 'o',
    type: String,
    description: 'The path of output zip file.',
    defaultValue: DEFAULT_OUT_FILE,
  },
  {
    name: 'help',
    type: Boolean,
    description: 'Display this usage guide.',
    defaultValue: false,
  },
];

// Parse the command line arguments
let options: CommandLineOptions;

/**
 * Displays the help guide.
 */
const displayHelp = () => {
  const usage = commandLineUsage([
    {
      header: 'build-tenders',
      content: appDescription,
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
  ]);
  console.log(usage);
};

/**
 * Processes command-line arguments and handles the `--help` flag.
 * If the `--help` flag is present, the help guide is displayed and the process exits.
 * If the `--path` argument is not provided, an error is thrown.
 * @throws {Error} Throws an error if the `--path` argument is not provided.
 */
export const processArgs = () => {
  options = commandLineArgs(optionDefinitions);
  // Handle the --help flag
  if (options.help) {
    displayHelp();
    process.exit(0);
  }

  if (!options.path) {
    throw new Error('--path is required');
  }
};

/**
 * Get the value of the `--path` argument.
 * @returns {string } The path to the root pn-paper-tenders.
 */
export const getPath = (): string => options.path;

/**
 * Get the value of the `--outFile` argument.
 * @returns {string} The path of the output zip file.
 */
export const getOutFilePath = (): string => options.outFile;
