const {createServer} = require('http')

let server = createServer((request, response) => {
  const handler = handlers[request.method] || notAllowed

  handler(request)
    .catch(value => {
      return value
    })
    .then(({status, body, type}) => {
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

const handlers = {
  async GET(request) {
    return {
      status: 200,
      type: 'application/json',
      body: '{"fruit":"banana"}'
    }
  }
}