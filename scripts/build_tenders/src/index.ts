import { processArgs, getPath, getOutFilePath } from './utils/cli';
import { validateRootDir } from './lib/validators/tender-structure';
import { DynamoDbTender, buildDynamoDbTender } from './lib/builder';
import { TenderFiles } from './types/tenders-files-types';
import { createDir, deleteDir, saveTender, zipDir } from './utils/file';
import { TMP_DIR } from './config';

// Process command-line arguments
processArgs();

console.log('\nValidating project structure');

// Validate the directory structure and get the tender tree
const tenderTree = validateRootDir(getPath());

// Recreate the temporary directory
deleteDir(TMP_DIR);
createDir(TMP_DIR);

Object.entries(tenderTree).forEach(([env, tenderFiles]) => {
  console.log(`Processing ${env}`);
  // Sort the tender files by tender ID
  tenderFiles
    .sort((a, b) => (a.tenderId > b.tenderId ? 1 : -1))
    // Map tender files to DynamoDB tender objects and save paths
    .map((tenderFiles): [DynamoDbTender, TenderFiles] => [
      buildDynamoDbTender(tenderFiles),
      tenderFiles,
    ])
    // Save each tender's data to JSON files
    .map(([tender, tenderFiles]) =>
      saveTender(tender, tenderFiles.tenderId, `./${TMP_DIR}/${env}`)
    );
});

// Zip temporary directory
zipDir(`./${TMP_DIR}`, getOutFilePath())