const arg1 = process.argv[2]
const arg2 = process.argv[3]

const num = Number(arg1)
const payload = JSON.parse(arg2)

console.log('argumento 1: ', num)
console.log('argumento 2: ', payload)

if (arg1 > 200) {
	const resultado = {
		state: "failure",
		data: "Fallo el script"
	}
	console.log( JSON.stringify(resultado) )
} else {
	const resultado = {
		state: "success",
		data: [arg1, arg2, new Date()]
	}
	console.log( JSON.stringify(resultado) )
}
