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
  let values
  try {
    values = JSON.parse(args[0])
  } catch (err) {
    throw new Error('values - invalid JSON format')
  }

  const topic = args[1]

  if (!Array.isArray(values)) {
    throw new Error('values - invalid argument')
  }

  if (values.length === 0) {
    return 'No se encontro el concepto'
  }

  let lines = ['Reporte de totales']
  lines.push(`---------------------------`)
  let sum = 0
  for (let index = 0; index < values.length; index++) {
    const value = values[index]
    const num = strToNumCalc(value)
    sum += num
    lines.push(value)
  }

  lines.push(`---------------------------`)
  lines.push(`Total: ${sum.toLocaleString('es-AR')}`)

  return lines.join("\n")
}

/**
 * @param String
 * @return Number
 */
const strToNumCalc = (str) => {
  return Number(str.replace('.','').replace(',','.'))
}

if (require.main === module) {
  main(process.argv.slice(2)).then(console.log).catch(console.error)
}

