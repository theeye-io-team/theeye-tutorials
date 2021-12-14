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
  let payload
  try {
    payload = JSON.parse(args[0])
  } catch (err) {
    throw new Error('payload - invalid JSON format')
  }

  let report = {}
  for (let topic in payload) {
    let lines = []

    const totals = payload[topic]
    if (!Array.isArray(totals)) {
      throw new Error('payload - invalid argument. total is not defined')
    }

    if (totals.length === 0) {
      return 'No se encontro el concepto'
    }

    lines.push('--------------------------')
    let sum = 0
    for (let index = 0; index < totals.length; index++) {
      const value = totals[index]
      const num = strToNumCalc(value)
      sum += num
      lines.push(value)
    }

    lines.push('-------------------------')
    lines.push(`Total ${topic}: ${sum.toLocaleString('es-AR')}`)

    report[ topic ] = lines.join("<br>\n") // text + html new line
  }

  return { data: report }
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

