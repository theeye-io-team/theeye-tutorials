
const fs = require('fs')
const Workflow = require('theeye-sdk/core/api/workflow')

const WF_ID = process.env.WF_ID
const WF_SECRET = process.env.WF_SECRET
const ACCESS_TOKEN = process.env.ACCESS_TOKEN

// distpacher
const main = module.exports = async () => {
  const args = process.argv.slice(2)
  const directory = args[0]
 
  const files = fs.readdirSync(directory)
  console.log(files)
  
  const promises = []
  for (let index = 0; index < files.length; index++) {
    const filename = files[index]
    
    const content = fs.readFileSync(`${directory}/${filename}`)
    const mime = 'text/plain'
    const data = `data:${mime};base64,${content.toString('base64')}`

    const task_arguments = [ data, 'BRUTO' ]
    
    console.log(`running workflow for file ${directory}/${filename}`)
    
    const api = new Workflow({ access_token: ACCESS_TOKEN })
    const workflow = await api.run({ id: WF_ID, secret: WF_SECRET, task_arguments })
    console.log(workflow.id)
  }
  
  return {}
}

// invoke main and capture result output
main().then(successOutput).catch(failureOutput)
