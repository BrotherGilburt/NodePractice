const {createServer} = require('http')
const api = require('./services/mockup.js')

let server = createServer((request, response) => {
  const handler = handlers[request.method] || notAllowed

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

const handlers = {
  async GET(request) {
    let data
    try {
      //disclaimer: (obviously) not designed to handle parameters
      data = await getAPI[request.url]()
    } catch (error) {
      return notFound(request)
    }
    return {
      status: 200,
      type: 'application/json',
      body: JSON.stringify(data)
    }
  }
}

const getAPI = {
  '/': api.getResume,
  '/education': api.getEducation,
  '/experience': api.getExperience,
  '/knowledgeandskills': api.getKnowledgeAndSkills
}