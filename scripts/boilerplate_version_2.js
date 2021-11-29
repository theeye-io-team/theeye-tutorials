require('dotenv').config()

// Boilerplate Location
const TheEyeBoilerplate = require(process.env.THEEYE_BOILERPLATE_LOCATION)

const script = process.env.SCRIPT_LOCATION

if (!script) {
  throw new Error('SCRIPT_LOCATION env is undefined')
}

// Our script
TheEyeBoilerplate.run(script)
