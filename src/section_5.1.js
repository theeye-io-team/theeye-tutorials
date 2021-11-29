const TheEyeBoilerplate = require('./lib/theeye_boilerplate')

// handler function
const opReader = require('./lib/op_reader')

// invoke main and capture result output
const theEye = new TheEyeBoilerplate(opReader)

// handle the process and generate the output
theEye.run()
