const {createServer} = require('http')
const api = require('./services/mockup.js')

const methods = Object.create(null)

let server = createServer((request, response) => {
  const handler = methods[request.method] || notAllowed

  handler(request)
    .catch(error => {
      if (error.status) return error
      return {status: 500, body: error.message, type: 'text/plain'}
    })
    .then(({status = 200, body, type = 'text/plain'}) => {
      response.writeHead(status, {'Content-Type': type})
      response.write(body)
      response.end()
    })
})
server.listen(8000)
console.log('Server running: http://localhost:8000/')

async function notAllowed(request) {
  return {
    status: 405,
    type: 'text/plain',
    body: `method "${request.method}" not allowed`
  }
}

async function notFound(request) {
  return {
    status: 404,
    type: 'text/plain',
    body: `${request.url} not found`
  }
}


methods.GET = async function(request) {
    const data = await processGetRequest(request.url)

    if (!data) return notFound(request)

    return {
      status: 200,
      type: 'application/json',
      body: JSON.stringify(data)
    }
  }

async function processGetRequest(url) {
  const endpoint = api[url] 
  if (!endpoint) return null
  else return endpoint.get()
}