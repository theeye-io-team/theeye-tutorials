const fs = require('fs')
const readline = require('readline')

/**
 *
 * Dado un filename , busca todas las lineas que incluyan la category indicada.
 *
 * @param {String} filename
 * @param {String} category
 * @return {Array}
 *
 */
const main = module.exports = async (args) => {

  const [ filename, category ] = args

  const fileStream = fs.createReadStream(filename)

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const matches = []

  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.

    // CODE FOR SECTION 3B.
    const pattern = new RegExp(category)
    if (pattern.test(line)) {
      console.log(`Line for ${category}: ${line}`);

      const extract = new RegExp(' ([0-9]{1}[0-9\.,]*)-?$')
      const groups = line.match(extract)
      matches.push( groups[1] )
    }
  }

  return matches
}

if (require.main === module) {
  main(process.argv.slice(2))
}
