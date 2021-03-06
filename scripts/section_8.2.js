const fs = require('fs')
const path = require('path')

// NodeJs boilerplate
const main = async () => {
  const args = process.argv.slice(2)

  const lote = args[0]
  const importes = JSON.parse(args[1])

  const jobId = JSON.parse(process.env.THEEYE_JOB).id
  const wfJobId = JSON.parse(process.env.THEEYE_JOB_WORKFLOW).job_id
  const thisExecution = (wfJobId||jobId||(new Date()).getTime())
  
  const processed = process.env.PROCESSED_DIRECTORY

  const targetPath = `${processed}/${lote}`
  let isDir = fs.existsSync(targetPath) && fs.lstatSync(targetPath).isDirectory()
  if (!isDir) {
    fs.mkdirSync(targetPath)
  }
  
  console.log(importes)
  const filename = `${targetPath}/${thisExecution}.json`
  console.log(`creating data file ${filename}`)
  fs.writeFileSync(filename, JSON.stringify(importes))
  return { data: [ lote, filename ] } 
}

