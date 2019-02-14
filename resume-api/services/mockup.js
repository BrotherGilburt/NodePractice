const fs = require('fs')

const RESUME_FILE = 'resumeServer/services/resume.json'

async function readResumeFile() {
  return new Promise((resolve, reject)=> {
    fs.readFile(RESUME_FILE, 'utf-8', (error, text) => {
      if (error) {
        reject(error)
        return
      }
        resolve(JSON.parse(text))
    })
  })
}

async function getResume() {
  return readResumeFile()
}

async function getExperience() {
  const resume = await readResumeFile()
  return resume['Experience'] || {}
}

async function getKnowledgeAndSkills() {
  const resume = await readResumeFile()
  return resume['Knowledge and Skills'] || {}
}

async function getEducation() {
  const resume = await readResumeFile()
  return resume['Education'] || {}
}

module.exports = {
  getResume,
  getExperience,
  getKnowledgeAndSkills,
  getEducation
}