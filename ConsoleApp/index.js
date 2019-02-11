const Expenses = require('./Expenses.js')

const {readFile, writeFile} = require('fs');
const {extname} = require('path')

const OUTPUT_FILENAME = 'results.txt'

const headingRE = /^\[?([^\[\]]*)\]?$/
const dollarsRE = /^\$?-?(\d*\.\d{2})$/
const DOLLAR_COL = 'amount'
const dollarColRE = new RegExp(`^${DOLLAR_COL}$`, 'i')
const dateRE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
const DATE_COL = 'date'
const dateColRE = new RegExp(`^${DATE_COL}$`, 'i')
const CATEGORY_COL = 'category'
const categoryColRE = new RegExp(`^${CATEGORY_COL}$`, 'i')

function readFromFile(filename) {
  return new Promise((resolve, reject) => {
    readFile(filename, 'utf8', (error, text) => {
      if (error) reject(`could not read from ${filename}`)
      else resolve(text.length > 0 ? text : null)
    })
  })
}

function writeLinesToFile(filename, array) {
  return new Promise((resolve, reject) => {
    if (!array || array.length === 0) {
      reject(`no text to write to ${filename}`)
      return
    }
    const output = array.join('\n')
    writeFile(filename, output, error => {
      if (error) reject(`could not write to ${filename}`)
      else resolve({filename, output})
    })
  })
}

function parseExpenses(text) {
  if (!text) throw new Error(`no expenses provided`)
  
  const rows = text.split(/\r?\n/)
  const key = rows.shift().split(',').map(el => el.replace(headingRE,"$1").trim())

  if (!key.filter(el => dollarColRE.test(el)).length == 1) throw new Error(`must have one column labeled [${DOLLAR_COL}]`)
  if (!key.filter(el => categoryColRE.test(el)).length == 1) throw new Error(`must have one column labeled [${CATEGORY_COL}]`)
  
  const expenses = new Expenses()
  
  rows.map((el, rowNum) => {
    const row = Object.create(null)
    const columns = el.split(',')

    if (columns.length != key.length) throw new Error(`number of columns in row ${rowNum+2} do not match number of column labels`)

    columns.forEach((el, i) => {
      const col = key[i]
      if (col.match(dollarColRE)) {
        let dollars
        if (!(dollars = dollarsRE.exec(el.trim()))) throw new Error(`invalid ${col} in row ${rowNum+2}`)
        row[DOLLAR_COL] = Number.parseFloat(dollars[1])
      }
      else if (col.match(dateColRE)) {
        let date
        if(!(date = dateRE.exec(el.trim()))) throw new Error(`invalid ${col} in row ${rowNum+2}`)
        const [_, month, day, year] = date
        row[DATE_COL] = new Date(year, month-1, day)
      }
      else if (col.match(categoryColRE)) {
        if (el.length == 0) throw new Error(`invalid ${col} in row ${rowNum+2}`)
        row[CATEGORY_COL] = el.toLowerCase().trim()
      }
      else row[col.toLowerCase().trim()] = el.trim();
    })
    
    return row
  }).forEach(el => expenses.addRow(el))

  return expenses
}

function processResults(expenses) {
  const results = expenses.calculate()
  results.category = expenses.calculate(['total'], 'category')
  return results
}

function formatResults(results) {
  const categories = Object.entries(results.category)
    .sort()
    .map(([name, data]) => `${name}: $${data.total.toFixed(2)}`)

  return [
    'EXPENSES PER CATEGORY',
    '------',
    ...categories,
    '',
    'META',
    '------',
    `average: $${results.average.toFixed(2)}`,
    `total: $${results.total.toFixed(2)}`,
    `max: $${results.max.toFixed(2)}`,
    `min: $${results.min.toFixed(2)}`
  ]
}

if (!process.argv[2]) {
  console.log('please provide valid parameters: node test <inputfile>')
  process.exit(0);
}

if (extname(process.argv[2]) != '.csv') {
  console.log('<inputfile> must be a .csv file')
  process.exit(0);
}

readFromFile(process.argv[2])
  .then(value => parseExpenses(value))
  .then(value => processResults(value))
  .then(value => formatResults(value))
  .then(value => writeLinesToFile(OUTPUT_FILENAME, value))
  .then(({filename}) => console.log(`results written to ${filename}`))
  .catch(error => console.log(error.message))