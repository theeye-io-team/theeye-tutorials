// error and output handlers must go first.

/**
 * @param {Object}
 * @prop {Mixed} data
 * @prop {Array} components
 * @prop {Object} next
 */
const successOutput = ({ data, components, next }) => {
  // https://documentation.theeye.io/core-concepts/scripts/#passing-arguments-in-workflow
  const output = {
    state: "success",
    data,
    components, // https://documentation.theeye.io/core-concepts/tasks/script_type/#components
    next
  }
  console.log( JSON.stringify(output) )
  process.exit(0)
}

/**
 * @param {Error} err
 */
const failureOutput = (err) => {
  console.error(err)
  const output = {
    state: "failure",
    data: {
      message: err.message,
      code: err.code,
      data: err.data 
    }
  }
  console.error( JSON.stringify(output) )
  process.exit(1)
}

process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p)
  failureOutput(reason)
})

process.on('uncaughtException', err => {
  console.error(err, 'Uncaught Exception thrown')
  failureOutput(err)
})


const fs = require('fs')

const main = module.exports = async () => {

  const args = process.argv.slice(2)
  const lote = args[0]
  
  let reporte = [
    [
      'Numero OP',
      'Fecha de pago',
      'Tipo de Cambio Venta',
      'Total Importe Bruto en Pesos',
      'Total Importe Bruto en USD',
      'Total Importe FEE en Pesos',
      'Total Importe FEE en USD'
    ]
  ]
    
  const files = fs.readdirSync( `${process.env.PROCESSED_DIRECTORY}/${lote}` )
  files.forEach(filename => {
    console.log(`reding file ${filename}`)
    const content = JSON.parse(fs.readFileSync(`${process.env.PROCESSED_DIRECTORY}/${lote}/${filename}`))
    const fila = new Array(7)
    for (let i=0; i<fila.length; i++) { fila[i] = '' }
    fila[3] = totalize(content['BRUTO'])
    fila[4] = dollarize(fila[3], content['cotizacion'])
    fila[5] = totalize(content['FEE'])
    fila[6] = dollarize(fila[5], content['cotizacion'])
    reporte.push(fila)
  })

  return { data: makeTableHTML(reporte) }
}
function dollarize (value, cotizacion) {
  console.log(cotizacion)
  const usd = Number.parseFloat(cotizacion.historico.dolar[0].Venta.replace(',','.'))
  const pesos = Number.parseFloat(value.replace('.','').replace(',','.'))
  console.log(usd)
  return (pesos / usd).toFixed(2).toLocaleString('es-AR')
}
function totalize (values) {
  return values.reduce((sum, a) => sum + strToNumCalc(a), 0).toLocaleString('es-AR')
}
function makeTableHTML (myArray) {
    var result = "<table border=1>";
    for(let i=0; i<myArray.length; i++) {
        result += "<tr>";
        for(let j=0; j<myArray[i].length; j++){
            result += "<td>"+myArray[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}

/**
 * @param String
 * @return Number
 */
const strToNumCalc = (str) => {
  return Number(str.replace('.','').replace(',','.'))
}

// invoke main and capture result output
main( process.argv.slice(2) ).then(successOutput).catch(failureOutput)

