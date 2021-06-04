const fs = require('fs');

const tiddlersFileLocation = '/home/valerian/Programming/tw-unstream/tiddlers.json'
const flattenedFileLocation = '/home/valerian/Programming/tw-unstream/tiddlers_flattened.json'

const rawData = fs.readFileSync(tiddlersFileLocation, 'utf8');
const entries = JSON.parse(rawData);

const resultDictionary = {};

// First pass we grab all of the names to simplify flattening the stream-list
console.log('Parsing entries...');
for (const entry of entries) {
  const key = entry.title.trim();
  resultDictionary[key] = entry;
}

console.log('Stitching tiddlers...');
// We want to only have parents, i.e. entry.parent == null
const flattenedOutput = []
for (const entry of entries) {
  const isParent = entry.parent == null;
  if (isParent) {
    const newEntry = {};
    newEntry.title = entry.title;
    newEntry.tags = entry.tags;
    newEntry.modified = entry.modified;
    newEntry.created = entry.created;
    newEntry.text = '';

    const children = entry['stream-list'];
    if (children) {
      for (const child of children.split(' ')) {
        const childEntry = resultDictionary[child.trim()];
        if (childEntry) {
          newEntry.text += childEntry.text + '\n\n'; // needs two apparently
        }
      }
      flattenedOutput.push(newEntry);
    }
  }
}

console.log('Writing file output...');
const outputJson = JSON.stringify(flattenedOutput);

fs.writeFileSync(flattenedFileLocation, outputJson);

console.log('Done!');