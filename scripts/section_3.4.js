// error and output handlers must go first.

/**
 * @param {Object}
 * @prop {Mixed} data
 * @prop {Array} components
 * @prop {Object} next
 */
const successOutput = ({ data, components, next }) => {
  // https://documentation.theeye.io/core-concepts/scripts/#passing-arguments-in-workflow
  const output = {
    state: "success",
    data,
    components, // https://documentation.theeye.io/core-concepts/tasks/script_type/#components
    next
  }
  console.log( JSON.stringify(output) )
  process.exit(0)
}

/**
 * @param {Error} err
 */
const failureOutput = (err) => {
  console.error(err)
  const output = {
    state: "failure",
    data: {
      message: err.message,
      code: err.code,
      data: err.data 
    }
  }
  console.error( JSON.stringify(output) )
  process.exit(1)
}

process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p)
  failureOutput(reason)
})

process.on('uncaughtException', err => {
  console.error(err, 'Uncaught Exception thrown')
  failureOutput(err)
})

const fs = require('fs')
const readline = require('readline')

// NodeJs boilerplate
const main = async (filename, category) => {

  console.log(filename, category)

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

      const extract = new RegExp(' ([0-9]{1}[0-9\.,]*)$')
      const groups = line.match(extract)
      matches.push( groups[1] )
    }
  }
  
  return { data: matches }
}


// invoke main and capture result output
main(process.argv[2], process.argv[3]).then(successOutput).catch(failureOutput)
