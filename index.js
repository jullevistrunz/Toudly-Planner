const http = require('http')
const url = require('url')
const fs = require('fs')
const crypto = require('crypto')
const { parse } = require('querystring')
const port = 80
const dataPath = 'data/'
//sessionIDs storage
let sessionIDs = new Object()
let sessionIDsLog = new Array()
setInterval(() => {
  sessionIDsLog = []
  for (let i = 0; i < Object.keys(sessionIDs).length; i++) {
    sessionIDsLog.push(sessionIDs[Object.keys(sessionIDs)[i]])
  }
}, 600000) //every 5 min: 300000

//server
const server = http.createServer(function (req, res) {
  let path = url.parse(req.url, true).pathname
  let query = url.parse(req.url, true).query
  let errArr = ['server']
  if (path == '/') {
    //homepage
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(fs.readFileSync('html/main.html'))
    res.end()
  } else if (path.startsWith('/css/')) {
    const file = path.substring('/css/'.length)
    try {
      res.writeHead(200, { 'Content-Type': 'text/css' })
      res.write(fs.readFileSync('css/' + file))
    } catch {
      res.writeHead(301, { Location: '/404' })
    }
    res.end()
  } else if (path.startsWith('/js/')) {
    const file = path.substring('/js/'.length)
    try {
      res.writeHead(200, { 'Content-Type': 'text/js' })
      res.write(fs.readFileSync('js/' + file))
    } catch {
      res.writeHead(301, { Location: '/404' })
    }
    res.end()
  } else if (path.startsWith('/svg/')) {
    const file = path.substring('/svg/'.length)
    try {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
      res.write(fs.readFileSync('svg/' + file))
    } catch {
      res.writeHead(301, { Location: '/404' })
    }
    res.end()
  } else if (path === '/404') {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.write(fs.readFileSync('html/404.html'))
    res.end()
  } else if (path == '/register') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(fs.readFileSync('html/register.html'))
    res.end()
  } else if (path == '/login') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(fs.readFileSync('html/login.html'))
    res.end()
  } else if (path == '/error') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(fs.readFileSync('html/error.html'))
    res.end()
  } else if (path == '/setSessionID') {
    errArr.push('setSessionID')
    if (!query['sessionID'] || !query['name']) {
      errArr.push('invalidQueryString')
      res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
      res.end()
      return
    }
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(fs.readFileSync('html/setSessionID.html'))
    res.end()
  } else if (path == '/logout') {
    errArr.push('logout')
    if (!query['sessionID'] || !query['name']) {
      errArr.push('invalidQueryString')
      res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
      res.end()
      return
    }
    if (
      !sessionIDsLog.includes(query['sessionID']) &&
      sessionIDs[query['name']]
    ) {
      errArr.push('invalidSessionID')
      res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
      res.end()
      return
    }
    delete sessionIDs[query['name']]
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(fs.readFileSync('html/logout.html'))
    res.end()
  } else if (path == '/user') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(fs.readFileSync('html/user.html'))
    res.end()
  }
  //! post
  else if (path.startsWith('/post/')) {
    errArr.push('post')
    let url = path.substring('/post/'.length)
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      if (url == 'register') {
        errArr.push('register')
        let data = parse(body)
        if (
          !data.name ||
          !data.password ||
          data.name.length < 4 ||
          data.password.length < 6 ||
          !data.name.match(/^[a-zA-Z0-9_.-]*$/) ||
          !data.password.match(/^[a-zA-Z0-9_.-]*$/)
        ) {
          errArr.push('invalidData')
          res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
          res.end()
          return
        }
        const oldFile = JSON.parse(fs.readFileSync(`${dataPath}user.json`))
        const sessionID = generateSessionID()
        if (oldFile[data.name]) {
          errArr.push('nameAlreadyRegistered')
          res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
          res.end()
          return
        }
        //hash password
        const salt = crypto.randomBytes(16).toString('hex')
        const hashedPassword = crypto
          .scryptSync(data.password, salt, 64)
          .toString('hex')
        //store data in user.json
        let newObj = new Object()
        newObj[data.name] = {
          password: `${salt}:${hashedPassword}`,
        }
        fs.writeFileSync(
          `${dataPath}user.json`,
          JSON.stringify({ ...oldFile, ...newObj })
        )
        fs.writeFileSync(`${dataPath}plans/${data.name}.json`, '[]')
        //store sessionID in memory
        let devices = new Array()
        for (let i = 0; i < Object.keys(sessionIDs).length; i++) {
          if (Object.keys(sessionIDs).startsWith(data.name)) {
            devices.push(sessionIDs[Object.keys(sessionIDs)[i]])
          }
        }
        let newName = `${data.name}@0`
        let newSessionIDObj = new Object()
        newSessionIDObj[newName] = sessionID
        sessionIDs = { ...sessionIDs, ...newSessionIDObj }
        sessionIDsLog.push(sessionID)
        res.writeHead(301, {
          Location: `/setSessionID?sessionID=${sessionID}&name=${newName}`,
        })
        res.end()
      } else if (url == 'login') {
        errArr.push('login')
        let data = parse(body)
        if (!data.name || !data.password) {
          errArr.push('invalidData')
          res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
          res.end()
          return
        }
        const oldFile = JSON.parse(fs.readFileSync(`${dataPath}user.json`))
        const sessionID = generateSessionID()
        if (!oldFile[data.name]) {
          errArr.push('nameDoesNotExist')
          res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
          res.end()
          return
        }
        //password
        const [salt, key] = oldFile[data.name].password.split(':')
        const hashedPassword = crypto
          .scryptSync(data.password, salt, 64)
          .toString('hex')
        if (key != hashedPassword) {
          errArr.push('wrongPassword')
          res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
          res.end()
          return
        }
        //store sessionID in memory
        let devices = new Array()
        for (let i = 0; i < Object.keys(sessionIDs).length; i++) {
          if (Object.keys(sessionIDs)[i].split('@')[0] == data.name) {
            devices.push(sessionIDs[Object.keys(sessionIDs)[i]])
          }
        }
        let newName = `${data.name}@0`
        if (sessionIDs[`${data.name}@0`]) {
          newName = `${data.name}@${
            parseInt(
              Object.keys(sessionIDs)[devices.length - 1].split('@')[1]
            ) + 1
          }`
        }
        let newSessionIDObj = new Object()
        newSessionIDObj[newName] = sessionID
        sessionIDs = { ...sessionIDs, ...newSessionIDObj }
        sessionIDsLog.push(sessionID)
        res.writeHead(301, {
          Location: `/setSessionID?sessionID=${sessionID}&name=${newName}`,
        })
        res.end()
      } else if (url == 'sessionIDLogin') {
        errArr.push('sessionIDLogin')
        let data = parse(body)
        if (!data.name || !data.sessionID) {
          errArr.push('invalidData')
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.write(`{"data":"${errArr.join('.')}"}`)
          res.end()
          return
        }
        if (!sessionIDsLog.includes(data.sessionID)) {
          errArr.push('invalidSessionID')
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.write(`{"data":"${errArr.join('.')}"}`)
          res.end()
          return
        }
        const oldFile = JSON.parse(fs.readFileSync(`${dataPath}user.json`))
        let devices = new Array()
        for (let i = 0; i < Object.keys(oldFile).length; i++) {
          if (Object.keys(oldFile)[i].split('@')[0] == data.name) {
            devices.push(oldFile[Object.keys(oldFile)[i]])
          }
        }
        let included = new Boolean()
        for (let i = 0; i < devices.length; i++) {
          if (Object.keys(oldFile).includes(`${data.name}@${i}`)) {
            included = true
          }
        }
        if (!included) {
          errArr.push('nameDoesNotExist')
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.write(`{"data":"${errArr.join('.')}"}`)
          res.end()
          return
        }
        //renew sessionID
        const sessionID = generateSessionID()
        let newSessionIDObj = new Object()
        newSessionIDObj[data.name] = sessionID
        sessionIDs = { ...sessionIDs, ...newSessionIDObj }
        sessionIDsLog.push(sessionID)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(`{"data":{"sessionID":"${sessionID}"}}`)
        res.end()
      } else if (url == 'getPlans') {
        errArr.push('getPlans')
        let data = parse(body)
        if (!data.name || !data.sessionID) {
          errArr.push('invalidData')
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.write(`{"data":"${errArr.join('.')}"}`)
          res.end()
          return
        }
        if (data.sessionID != sessionIDs[data.name]) {
          errArr.push('invalidSessionID')
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.write(`{"data":"${errArr.join('.')}"}`)
          res.end()
          return
        }
        const oldFile = JSON.parse(fs.readFileSync(`${dataPath}user.json`))
        let devices = new Array()
        for (let i = 0; i < Object.keys(oldFile).length; i++) {
          if (Object.keys(oldFile)[i].split('@')[0] == data.name) {
            devices.push(oldFile[Object.keys(oldFile)[i]])
          }
        }
        let included = new Boolean()
        for (let i = 0; i < devices.length; i++) {
          if (Object.keys(oldFile).includes(`${data.name}@${i}`)) {
            included = true
          }
        }
        if (!included) {
          errArr.push('nameDoesNotExist')
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.write(`{"data":"${errArr.join('.')}"}`)
          res.end()
          return
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(
          `{"data":{"plans":${fs.readFileSync(
            `${dataPath}plans/${data.name.split('@')[0]}.json`
          )}}}`
        )
        res.end()
      } else if (url == 'removePlan') {
        errArr.push('removePlan')
        let data = parse(body)
        if (!data.name || !data.sessionID || !data.plan) {
          errArr.push('invalidData')
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.write(`{"data":"${errArr.join('.')}"}`)
          res.end()
          return
        }
        if (data.sessionID != sessionIDs[data.name]) {
          errArr.push('invalidSessionID')
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.write(`{"data":"${errArr.join('.')}"}`)
          res.end()
          return
        }
        const oldFile = JSON.parse(fs.readFileSync(`${dataPath}user.json`))
        let devices = new Array()
        for (let i = 0; i < Object.keys(oldFile).length; i++) {
          if (Object.keys(oldFile)[i].split('@')[0] == data.name) {
            devices.push(oldFile[Object.keys(oldFile)[i]])
          }
        }
        let included = new Boolean()
        for (let i = 0; i < devices.length; i++) {
          if (Object.keys(oldFile).includes(`${data.name}@${i}`)) {
            included = true
          }
        }
        if (!included) {
          errArr.push('nameDoesNotExist')
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.write(`{"data":"${errArr.join('.')}"}`)
          res.end()
          return
        }
        let plans = JSON.parse(
          fs.readFileSync(`${dataPath}plans/${data.name.split('@')[0]}.json`)
        )
        for (let i = 0; i < plans.length; i++) {
          if (
            JSON.stringify(plans[i]) == JSON.stringify(JSON.parse(data.plan))
          ) {
            plans.splice(i, 1)
          }
        }
        fs.writeFileSync(
          `${dataPath}/plans/${data.name.split('@')[0]}.json`,
          JSON.stringify(plans)
        )
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(`{"data":"Success"}`)
        res.end()
      } else if (url == 'createPlan') {
        errArr.push('createPlan')
        let data = parse(body)
        if (!data.name || !data.sessionID || !data.content) {
          errArr.push('invalidData')
          res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
          res.end()
          return
        }
        if (data.sessionID != sessionIDs[data.name]) {
          errArr.push('invalidSessionID')
          res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
          res.end()
          return
        }
        const oldFile = JSON.parse(fs.readFileSync(`${dataPath}user.json`))
        let devices = new Array()
        for (let i = 0; i < Object.keys(oldFile).length; i++) {
          if (Object.keys(oldFile)[i].split('@')[0] == data.name) {
            devices.push(oldFile[Object.keys(oldFile)[i]])
          }
        }
        let included = new Boolean()
        for (let i = 0; i < devices.length; i++) {
          if (Object.keys(oldFile).includes(`${data.name}@${i}`)) {
            included = true
          }
        }
        if (!included) {
          errArr.push('nameDoesNotExist')
          res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
          res.end()
          return
        }
        const oldPlans = JSON.parse(
          fs.readFileSync(`${dataPath}/plans/${data.name.split('@')[0]}.json`)
        )
        let newDate = ''
        if (data.date) {
          newDate = data.date.split('-')
          const year = newDate[0]
          const month = newDate[1]
          const day = newDate[2]
          newDate[0] = month
          newDate[1] = day
          newDate[2] = year
          newDate = newDate.join('/')
        }

        const newPlan = [
          {
            title: data.title,
            date: newDate,
            time: data.time,
            content: data.content,
          },
        ]
        fs.writeFileSync(
          `${dataPath}/plans/${data.name.split('@')[0]}.json`,
          JSON.stringify([...oldPlans, ...newPlan])
        )
        res.writeHead(301, { Location: '/' })
        res.end()
      } else if (url == 'logoutAll') {
        errArr.push('logoutAll')
        let data = parse(body)
        if (!data.name || !data.password) {
          errArr.push('invalidData')
          res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
          res.end()
          return
        }
        const oldFile = JSON.parse(fs.readFileSync(`${dataPath}user.json`))
        if (!oldFile[data.name]) {
          errArr.push('nameDoesNotExist')
          res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
          res.end()
          return
        }
        //password
        const [salt, key] = oldFile[data.name].password.split(':')
        const hashedPassword = crypto
          .scryptSync(data.password, salt, 64)
          .toString('hex')
        if (key != hashedPassword) {
          errArr.push('wrongPassword')
          res.writeHead(301, { Location: `/error?e=${errArr.join('.')}` })
          res.end()
          return
        }

        //remove sessionIDs
        for (let i = 0; i < Object.keys(sessionIDs).length; i++) {
          if (Object.keys(sessionIDs)[i].startsWith(data.name)) {
            delete sessionIDs[Object.keys(sessionIDs)[i]]
          }
        }
        sessionIDsLog = []
        for (let i = 0; i < Object.keys(sessionIDs).length; i++) {
          sessionIDsLog.push(sessionIDs[Object.keys(sessionIDs)[i]])
        }

        res.writeHead(301, { Location: `/` })
        res.end()
      } else {
        //page not found
        res.writeHead(301, { Location: '/404' })
        res.end()
      }
    })
  } else {
    //page not found
    res.writeHead(301, { Location: '/404' })
    res.end()
  }
})
server.listen(port, function (error) {
  if (error) {
    console.log('Something went wrong' + error)
  } else {
    console.log('Listening on http://localhost:' + port)
  }
})

//funcs
function generateSessionID() {
  return crypto.randomBytes(32).toString('hex')
}
