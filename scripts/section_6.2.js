
const AdmZip = require('adm-zip')
const fs = require('fs')

const main = module.exports = async (args) => {

  const filename = args[0]

  const zip = new AdmZip(filename)
  zip.extractAllTo(process.env.EXTRACTION_PATH, true)

  const files = fs.readdirSync(process.env.EXTRACTION_PATH)
  return { data: files }
}


if (require.main === module) {
  main(process.argv.slice(2)).then(console.log).catch(console.error)
}
