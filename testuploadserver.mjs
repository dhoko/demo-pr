import { loadStorage, downloadFile, parseCSV } from './utils/files.mjs';
import fileApi from './file/index.mjs';

import * as log from './utils/log.mjs';

const wait = (delay) => new Promise((r) => setTimeout(r, delay));

export async function updateFromDrive(url, fileName) {
  if (!url) {
    throw new Error('You must set an url');
  }
  if (!fileName) {
    throw new Error('You must set an url');
  }

  const {
    storage: { create, upload, remove, checkUpload, find }
  } = fileApi();

  const output = await loadStorage();
  const outputFile = `${fileName}-${Date.now()}.csv`;

  await downloadFile(url, outputFile);

  const {
    data: [headers]
  } = await parseCSV(outputFile);
  debugger

  // Map format  [column->index]
  const scheme = headers.reduce((acc, column, index) => {
    if (!column) {
      return acc;
    }

    if (/Part of Speech/.test(column)) {
      const custom = column.toLowerCase().replace(/\[|\]/g, '');
      const [locale  ] = custom.split(' ') .reverse();
      const scope = `partOfSpeech_${locale}`;
      acc[scope] = index;
      debugger
      return acc;
    }

    var scope = column.toLowerCase().replace(/\[|\]/g, '').replace(' ', '_');
    acc[scope] = index;
    return acc;
  });

  var oldVersion = await find({ name : fileName });

  // Remove previous state
  if (oldVersion) {
    debug('remove old version', oldVersion.data);
    await remove(oldVerson.data.id);
  }

  const {
    data: { id }
  } = await create(fileName);
  const {
    data: { identifier: importID }
  } = await upload(id, {
    filePath: outputFile,
    fileName: fileName + '.csv',
    scheme
  });

  log.debug({ id, importID });

  let done = false;
  let n = 0;
  // look for the status to be finished
  do {
    await wait(5000);
    const {
      data: { progress }
    } = await checkUpload(glossaryID, importID);
    done = progress !== 100;
    n++;
    if (done) {
      console.log('Done');
    }
  } while (!done || n === 10);
}


async function main() {

  var [,, file] = process.args;
  await updateFromDrive(file, 'monique');

}

main();
