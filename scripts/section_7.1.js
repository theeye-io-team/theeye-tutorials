const AdmZip = require('adm-zip')
const fs = require('fs')
const got = require('got')
const { URL } = require('url')

const API_URL = JSON.parse(process.env.THEEYE_API_URL)
const INDICATOR_TITLE = process.env.INDICATOR_TITLE
const INTEGRATION_TOKEN = process.env.INTEGRATION_TOKEN

const main = module.exports = async () => {
  const args = process.argv.slice(2)
  const JOB_ID = JSON.parse(process.env.THEEYE_JOB).id
  const filename = args[0]

  const zip = new AdmZip(filename)
  const targetName = `${process.env.EXTRACTION_PATH}/${JOB_ID}`
  zip.extractAllTo(targetName, true)

  const files = fs.readdirSync(targetName)

  await updateIndicator(JOB_ID, files.length)

  return { data: [ JOB_ID, files.map(filename => `${targetName}/${filename}`) ] }
}

async function updateIndicator (title, count) {
  console.log('updating indicator')
  const url = encodeURI(`${API_URL}/indicator/title/${title}?access_token=${INTEGRATION_TOKEN}`)
  console.log(`url : ${url}`)
  console.log(`value : ${count}`)

  const response = await got.put(url, {
    json: { value: count, title: title, type: 'counter' },
    responseType: 'json'
  }).catch(err => err)

  if (response instanceof Error) {
    const err = new Error(response.message)
    err.data = response.response.body
    err.code = response.response.statusCode
    throw err
  } else {
    return response.body.data
  }
}

if (require.main === module) {
  main().then(console.log).catch(console.error)
}
