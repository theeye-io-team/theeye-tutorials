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

class TheEyeBoilerplate {
  constructor (handler, path) {
    const handlerName = `${path}/${handler}`
    try {
      const handler = require(handlerName)
      this.handler = handler
    } catch (err) {
      throw new Error(`Handler ${handlerName} not found`)
    }
  }

  async run () {
    const args = process.argv.slice(2)

    // collect handler result
    await this.execute(args)

    // generate the lastline
    this.report()

    return this
  }

  /*
   * @param {Array} args
   * @return {TheEyeBoilerplate}
   */
  async execute (args) {
    try {
      const value = this.handler(args)
      let output
      if (value instanceof Promise) {
        // await promise resolve
        output = await value
      } else {
        output = value
      }

      if (
        output !== undefined &&
        output !== null &&
        output.hasOwnProperty('data')
      ) {
        this.output = output
      } else {
        this.output = { data: output }
      }
    } catch (err) {
      this.err = err
    }

    return this
  }

  report () {
    if (this.err) {
      failureOutput(this.err)
    } else {
      successOutput(this.output)
    }
  }
}

module.exports = TheEyeBoilerplate
