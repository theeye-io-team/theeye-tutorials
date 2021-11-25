
const arg1 = process.argv[2]
const arg2 = process.argv[3]

console.log(`Argument 1: ${arg1}`)
console.log(`Argument 2: ${arg2}`)

if (arg1 === 'error') {
  console.log('failure')
} else {
  console.log('success')
}

