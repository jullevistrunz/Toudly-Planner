let query = new URLSearchParams(window.location.search)

const qSessionID = query.get('sessionID')
const qName = query.get('name')

localStorage.setItem('sessionID', qSessionID)
localStorage.setItem('name', qName)
location.href = '/'
