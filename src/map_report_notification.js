/**
 * @param {String} Report
 * @return {Array}
 */
const main = module.exports = async (args) => {
  const reports = JSON.parse(args[0])


  let subject = 'Reporte totales'
  let message = ''
  for (let topic in reports) {
    subject += ` ${topic}`
    message += reports[topic]
  }

  return [subject, message, '']
}

if (require.main === module) {
  main(process.argv.slice(2)).then(console.log).catch(console.error)
}
