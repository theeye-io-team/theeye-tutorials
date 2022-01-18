const got = require('got')
const https = require('https')
const { URL } = require('url')

const API_URL = JSON.parse(process.env.THEEYE_API_URL)
const INTEGRATION_TOKEN = process.env.INTEGRATION_TOKEN

const WF_ID = process.env.WF_ID
const WF_SECRET = process.env.WF_SECRET


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
      const task_arguments = [ title ]
      const response = await launchWorkflow(task_arguments)
    }
    return { data: response.body.data }
  }
}

const launchWorkflow = (task_arguments) => {
  return new Promise((resolve, reject) => {

    const wfUrl = `${API_URL}/workflows/${WF_ID}/secret/${WF_SECRET}/job`
    const url = new URL(wfUrl)

    const reqOpts = {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      port: url.port,
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`
    }
    
    const req = https.request(reqOpts, res => {
      let str = ''
      res.on('data', d => {
        if (d) { str += d; }
      })
      res.on('end', () => {
        res.body = str
        
        if (res.statusCode >= 500) {
          const error = new Error('Internal Server Error')
          error.res = res
          return reject(error)
        }
        if (res.statusCode >= 400) {
          const error = new Error('Invalid Request')
          error.res = res
          return reject(error)
        }
        resolve(res)
      })
    })

    req.on('error', reject)

    if (task_arguments) {
      console.log(task_arguments)
      const payload = JSON.stringify(task_arguments)
      req.write(payload)
    }

    req.end()
  })
}

