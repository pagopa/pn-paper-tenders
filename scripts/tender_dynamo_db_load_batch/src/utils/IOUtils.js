const decompress = require('decompress');
const fs = require('fs');

const errors = {
  EMPTY_SOURCE: 'Source parameter cannot be empty, null or undefined',
  EMPTY_TARGET: 'Target parameter cannot be empty, null or undefined',
};

/**
 * Unzip compressed source file to target folder.
 * Optionally a callback can be called after decompression to perform generic task on extracted files.
 *
 * @param source    compressed file location
 * @param target    destination folder in which save extracted files
 * @param filter    optional file filtering function
 *
 * @return Promise  decompression task promise containing extracted paths
 * */
async function unzip(source, target, filter) {
  if (!source) throw new Error(errors.EMPTY_SOURCE);
  if (!target) throw new Error(errors.EMPTY_TARGET);

  const opts = {};
  if (filter) opts.filter = filter;

  return decompress(source, target, opts)
    .then((files) => {
      console.log(`Decompressed ${files.length} files in ${target} folder`);
      return files.map((file) => file.path);
    })
    .catch((err) =>
      console.error(`Error while decompressing ${source}: ${err}`)
    );
}

function readSync(source) {
  console.info(`Reading file from ${source} using synchronous API`);
  return fs.readFileSync(source, { encoding: 'utf8', flag: 'r' });
}

function writeSync(target, stream) {
  console.info(`Writing file to ${target} using synchronous API`);
  return fs.writeFileSync(target, stream);
}

function makeDirSync(path) {
  if (!fs.existsSync(path)) return fs.mkdirSync(path, { recursive: true });
}

module.exports = {
  unzip: unzip,
  readSync: readSync,
  makeDirSync: makeDirSync,
  writeSync: writeSync,
};
