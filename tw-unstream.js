const fs = require('fs');

const tiddlersFileLocation = './tiddlers.json'
const flattenedFileLocation = './tiddlers_flattened.json'

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
  const isRoot = entry.parent == null;
  if (isRoot) {
    const newEntry = {};
    newEntry.title = entry.title;
    newEntry.type = entry.type;
    newEntry.tags = entry.tags;
    newEntry.modified = entry.modified;
    newEntry.created = entry.created;
    newEntry.text = getChildText(entry, 1)

    flattenedOutput.push(newEntry);
  }
}

function getChildText(node, level) {

  let output = '';

  if (node == null) {
    return output;
  }

  // PNGs and such, just delete them
  if (node.type != null) {
    return output
  }

  if (node.text && node.text.trim()) {
    let depth = level;
    while (depth) {
      output += '*';
      depth--;
    }
    output += ` ${node.text}\n`;
    level += 1;
  }

  const children = node['stream-list'];
  if (children) {
    for (const child of children.split(' ')) {
      const childEntry = resultDictionary[child.trim()];
      output += getChildText(childEntry, level);
    }
  }

  return output;
}

console.log('Writing file output...');
const outputJson = JSON.stringify(flattenedOutput);

fs.writeFileSync(flattenedFileLocation, outputJson);

console.log('Done!');
