const fs = require('fs')
const readline = require('readline')

/**
 *
 * Dado un filename , busca todas las lineas que incluyan la concepto indicada.
 *
 * @param {String} filename
 * @param {String<Array>} conceptos JSON
 * @return {Array}
 *
 */
const main = module.exports = async (args) => {
  args || (args = process.argv.slice(2))

  const filename = args[0]
  const conceptos = JSON.parse(args[1])

  const fileStream = fs.createReadStream(filename)

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const totals = {}

  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.

    for (let concepto of conceptos) {
      if (!totals[concepto]) { totals[concepto] = [] }

      // CODE FOR SECTION 3B.
      const pattern = new RegExp(concepto)
      if (pattern.test(line)) {
        console.log(`Line for ${concepto}: ${line}`);

        const extract = new RegExp(' ([0-9]{1}[0-9\.,]*)-?$')
        const groups = line.match(extract)
        totals[concepto].push(groups[1])
      }
    }
  }

  return { data: totals }
}

if (require.main === module) {
  main(process.argv.slice(2)).then(console.log).catch(console.error)
}
