
const AdmZip = require('adm-zip')
const fs = require('fs')

const main = module.exports = async () => {
  const args = process.argv.slice(2)
  const JOB_ID = JSON.parse(process.env.THEEYE_JOB).id
  const filename = args[0]

  const zip = new AdmZip(filename)
  const targetName = `${process.env.EXTRACTION_PATH}/${JOB_ID}`
  zip.extractAllTo(targetName, true)

  const files = fs.readdirSync(targetName)
  return { data: [ files.map(filename => `${targetName}/${filename}`) ] }
}

if (require.main === module) {
  main().then(console.log).catch(console.error)
}
