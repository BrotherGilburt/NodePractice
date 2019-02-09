export default class Expenses {
  constructor() {
    this._expenses = []
  }
  addRow(data) {
    const {category, amount, date} = data
    this._expenses.push({category, amount, date})
  }
  calculate(operations = ['average', 'max', 'min', 'total'], group) {
    //TODO: if group...

    const results = {}

    //initialize
    operations.forEach(op => {
      if (!statistics[op]) return

      results[op] = statistics[op].init
    })

    //forEach
    this._expenses.forEach(({amount}) => {
      operations.forEach(op)
      if (!statistics[op]) return
      
      results[op] = statistics[op].forEach(amount, results[op])
    })

    //after
    operations.forEach(op => {
      if (!statistics[op]) return

      if (statistics[op].after) results[op] = statistics[op].after(results[op], this._expenses)
    })

    return results
  }
  groupBy(grouper) {
    const groups = {}
    this._expenses.forEach((el) => {
      const name = grouper(el)
      if (!groups[name]) groups[name] = [el]
      else groups[name].push(el)
    })
    return groups
  }
}

const statistics = {
  average: {
    after(value, array) {
      return value / array.length
    },
    init: 0,
    forEach(value, accumulator) {
      return accumulator + value
    }
  },
  max: {
    init: 0,
    forEach(value, accumulator) {
      if (!accumulator) return value
      return value > accumulator ? value : accumulator
    }
  },
  min: {
    init: 999999999999999,
    forEach(value, accumulator) {
      if (!accumulator) return value
      return value < accumulator ? value : accumulator
    }
  },
  mode: {
    after(value, array) {
      mode = Object.entries(value).reduce((acc, cur) => acc[1] < cur[1] ? cur : acc, [0, 0])
      return mode[0]
    },
    init: {},
    forEach(value, accumulator) {
      if (typeof value == 'number') value = Math.round(value)
      if (accumulator[value]) accumulator[value] = 1
      else accumulator[value]++
    }
  },
  total: {
    init: 0,
    forEach(value, accumulator) {
      return accumulator + value
    }
  }
}