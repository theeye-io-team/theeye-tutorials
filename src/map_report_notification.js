/**
 * @param {String} Report
 * @return {Array}
 */
const main = module.exports = async (args) => {
  const body = args[0]

  return [body, "", ""]
}

if (require.main === module) {
  main(process.argv.slice(2)).then(console.log).catch(console.error)
}
