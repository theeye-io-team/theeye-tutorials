require('dotenv').config()

const fs = require('fs')
const https = require('https')
const { URL } = require('url')

const WF_ID = process.env.CASO1_WF_ID
const WF_SECRET = process.env.CASO1_WF_SECRET
const API_URL = JSON.parse(process.env.THEEYE_API_URL)
const ORG_NAME = JSON.parse(process.env.THEEYE_ORGANIZATION_NAME)

// distpacher
const main = module.exports = async () => {
  const args = process.argv.slice(2)
  const lote = args[0]
  const filenames = JSON.parse(args[1])

  const promises = []
  for (let index = 0; index < filenames.length; index++) {
    const filename = filenames[index]
    
    const content = fs.readFileSync(filename)
    const mime = 'text/plain'
    const data = `data:${mime};base64,${content.toString('base64')}`

    console.log(`running workflow for file ${filename}`)

    const task_arguments = [ lote, data, ['BRUTO','FEE'] ]
    const response = await launchWorkflow(task_arguments)
    console.log(response.body)
  }

  return {}
}

const launchWorkflow = (task_arguments) => {
  return new Promise((resolve, reject) => {

    const wfUrl = `${API_URL}/workflows/${WF_ID}/secret/${WF_SECRET}/job?customer=${ORG_NAME}`
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

// invoke main and capture result output
main().then(console.log).catch(console.error)
