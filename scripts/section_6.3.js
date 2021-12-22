const fs = require('fs')

// distpacher
const main = module.exports = async (args) => {
  const files = fs.readdirSync(process.env.EXTRACTION_PATH)

  for (let index = 0; index < files.length; index++) {
    console.log(files[index])
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).then(console.log).catch(console.error)
}
