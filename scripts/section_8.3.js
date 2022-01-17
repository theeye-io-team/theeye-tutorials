const got = require('got')
const { URL } = require('url')

const API_URL = JSON.parse(process.env.THEEYE_API_URL)
const INTEGRATION_TOKEN = process.env.INTEGRATION_TOKEN

async function main () {
  
  const args = process.argv.slice(2)
  const title = args[0]
  
  console.log('updating indicator')
  //
  // provisional. la api de contador no admite URL con título.
  //
  let response

  const getUrl = encodeURI(`${API_URL}/indicator/title/${title}?access_token=${INTEGRATION_TOKEN}`)
  response = await got.get(getUrl, {responseType:'json'}).catch(err => err)
  
  const counter = response.body.value
  
  const patchUrl = encodeURI(`${API_URL}/indicator/${response.body.id}/decrease?access_token=${INTEGRATION_TOKEN}`)
  response = await got.patch(patchUrl, {responseType:'json'}).catch(err => err)
  
  if (response instanceof Error) {
    const err = new Error(response.message)
    err.data = response.response.body
    err.code = response.response.statusCode
    throw err
  } else {
    if (counter === 1) {
      console.log('lanzando workflow de generación de reporte')
    }
    return { data: response.body.data }
  }
}

