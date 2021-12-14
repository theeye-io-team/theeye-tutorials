
// NodeJs boilerplate
const main = module.exports = async () => {
  const file = process.argv[2]
  const concepto = process.argv[3]
  const result = { data: [file, concepto] }
  return result
}
