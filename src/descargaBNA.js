
const moment = require('moment')
const puppeteer = require('puppeteer')
const fs = require('fs')
const retry = require('async-retry')

const URL_BNA = (process.env.URL_BNA || 'https://www.bna.com.ar/Personas')
const HtmlTableToJson = require('html-table-to-json')

const main = module.exports = async () => {

  const args = process.argv.slice(2)
  const fechaParaHistorico = args[0]

  moment.locale('es')

  await retry(preparePage, {
    retries: 5,
    onRetry: async err => {
      console.log(err)
      console.log('Retrying...')
      await page.close()
      await browser.close()
    }
  })

  const resultados = await obtenerCotizaciones(fechaParaHistorico)
    .catch(err => {
      browser.close()
      throw err
    })

  browser.close()

  return { data: resultados }
}

const preparePage = async (bail) => {

  const webUrl = URL_BNA
  const headless = (process.env.HEADLESS !== 'false')

  browser = await puppeteer.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-features=site-per-process',
      '--disable-gpu',
      '--window-size=1920x1080'
    ]
  })
  viewPort = {
    width: 1300,
    height: 900
  }

  page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36')
  await page.setViewport(viewPort)
  await page.setDefaultNavigationTimeout(20000)
  await page.setDefaultTimeout(20000)

  await page.goto(webUrl, {
    waitUntil: 'networkidle0'
  })
}

const obtenerCotizaciones = async (fecha) => {
  const fechaHistorico = moment(fecha).format('DD/MM/YYYY')
  console.log(fechaHistorico)

  await page.waitForSelector('div.tabSmall')

  const tableBilletes = await page.evaluate(() => {
    const rowsBilletes = document.querySelector('#billetes > table')
    return rowsBilletes.outerHTML
  })

  const billetes = HtmlTableToJson.parse(tableBilletes)

  const tableDivisas = await page.evaluate(() => {
    const rowsDivisas = document.querySelector('#divisas > table')
    return rowsDivisas.outerHTML
  })

  const divisas = HtmlTableToJson.parse(tableDivisas)

  await page.click('#buttonHistoricoBilletes')
  await page.waitForSelector('#fecha')
  await page.$eval('#fecha', (element, fecha) => {
    element.value = fecha
  }, fechaHistorico)

  await page.evaluate(function () {
    $('#buscarHistorico').click()
  })
  // await page.waitForTimeout(5000)

  const tableDolar = await page.evaluate(() => {
    const rowsDolar = document.querySelector('#tablaDolar > table')
    return rowsDolar.outerHTML
  })
  const tableEuro = await page.evaluate(() => {
    const rowsEuro = document.querySelector('#tablaEuro > table')
    return rowsEuro.outerHTML
  })

  const dolar = HtmlTableToJson.parse(tableDolar)
  const euro = HtmlTableToJson.parse(tableEuro)

  const cotizaciones = {
    billetes: billetes.results[0],
    divisas: divisas.results[0],
    historico: {
      dolar: dolar.results[0],
      euro: euro.results[0]
    }
  }

  return cotizaciones
}

if (require.main === module) {
  main()
    .then(console.log)
    .catch(console.error)
}
