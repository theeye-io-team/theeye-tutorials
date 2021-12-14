const fs = require('fs')
const readline = require('readline')

/**
 * @param {String} filename
 * @return {Array}
 */
const main = module.exports = async (args) => {

  const [ filename ] = args

  const fileStream = fs.createReadStream(filename)

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  const matches = []

  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    console.log(`Line from file: ${line}`)
  }
}
