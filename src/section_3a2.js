
const arg1 = process.argv[2]
const arg2 = process.argv[3]

console.log(`Argument 1: ${arg1}`)
console.log(`Argument 2: ${arg2}`)

// javascript object
const data = [ arg1, arg2 ]
let state

if (arg1 === 'error') {
	state = 'failure'
} else {
	state = 'success'
}

const output = { state, data }
const lastline = JSON.stringify(output)
  
console.log(lastline)
