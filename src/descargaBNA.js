
// require('config/config')
const config = { webbot: { URL_BNA: 'https://www.bna.com.ar/Personas' } }
const moment = require('moment')
const puppeteer = require('puppeteer')
const fs = require('fs')
const retry = require('async-retry')
const path = require('path')
// const { url } = require('inspector')
const URL_BNA = config.webbot.URL_BNA
const HtmlTableToJson = require('html-table-to-json')

const dataOutput = (fecha) => {
  return new Promise(async function (resolve, reject) {
    try {
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

      browser.close()
      resolve(cotizaciones)
    } catch (err) {
      console.log(err)
      browser.close()
      reject(err)
    }
  })
}


const preparePage = async (webUrl) => {
  const headless = (process.env.HEADLESS === "false" ? false : true)

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

const main = module.exports = async (args) => {
  const fechaParaHistorico = args[0]

  moment.locale('es')

  await retry(async bail => {
    // console.log(URL_BNA)
    await preparePage(URL_BNA)
  }, {
    retries: 5,
    onRetry: async err => {
      console.log(err)
      console.log('Retrying...')
      await page.close()
      await browser.close()
    }
  })

  // const resultados = await processDataRequest(fechaParaHistorico)
  // const resultados = await dataOutput(fechaParaHistorico)
  return resultados = await dataOutput(fechaParaHistorico).then(results => { return results }).catch(error => {
    throw new Error(error)
  })
}

if (require.main === module) {
  main(process.argv.slice(2)).then(console.log).catch(console.error)
}
