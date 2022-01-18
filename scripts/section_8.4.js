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
    const content = JSON.parse(fs.readFileSync(`${process.env.PROCESSED_DIRECTORY}/${lote}/${filename}`))
    const fila = new Array(7)
    for (let i=0; i<fila.length; i++) { fila[i] = '' }
    fila[3] = totalize(content['BRUTO'])
    fila[5] = totalize(content['FEE'])
    reporte.push(fila)
  })
  
  return { data: makeTableHTML(reporte) }
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

