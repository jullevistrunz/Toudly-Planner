let todayDate = new Date()
let plansArr = new Array()
document.getElementById('registerBtn').addEventListener('click', () => {
  location.href = '/register'
})
document.getElementById('loginBtn').addEventListener('click', () => {
  location.href = '/login'
})

//from navbar
if (loggedIn) {
  let textForTime = 'Hello'
  textForTime = getTimeText(todayDate)
  document.getElementById('welcomeMsg').innerHTML = `${textForTime} ${
    localStorage.getItem('name').split('@')[0]
  }!`
  if (document.documentElement.clientWidth > 450) {
    setTimeDateMsg()
    setInterval(() => {
      todayDate = new Date()
      setTimeDateMsg()
    }, 1000)
  }
  document
    .getElementById('createPlanBtn')
    .addEventListener('click', () => openCreatePlanContainer())
  document
    .querySelector('#createPlanContainer .contentInp')
    .addEventListener('input', () => {
      if (document.querySelector('#createPlanContainer .contentInp').value) {
        document.querySelector('#createPlanContainer .submit').disabled = false
      } else {
        document.querySelector('#createPlanContainer .submit').disabled = true
      }
    })
  fetchRequests()
} else {
  document.getElementById('loginContainer').classList.remove('hidden')
  document.getElementById('mainContainer').classList.add('hidden')
}

//funcs
function fetchRequests() {
  //fetch login to server
  async function login(params) {
    let result = await fetch('/post/sessionIDLogin', {
      method: 'POST',
      body: `name=${params.name}&sessionID=${params.sessionID}`,
    })
    let response = await result.json()
    if (!response.data.sessionID) {
      location.href = `/logout?name=${localStorage.getItem(
        'name'
      )}&sessionID=${localStorage.getItem('sessionID')}`
    }
    localStorage.setItem('sessionID', response.data.sessionID)
    getPlans({
      name: localStorage.getItem('name'),
      sessionID: localStorage.getItem('sessionID'),
    })
  }
  login({
    name: localStorage.getItem('name'),
    sessionID: localStorage.getItem('sessionID'),
  })
  async function getPlans(params) {
    let result = await fetch('/post/getPlans', {
      method: 'POST',
      body: `name=${params.name}&sessionID=${params.sessionID}`,
    })
    let response = await result.json()
    let plans = response.data.plans
    if (!plans) {
      location.href = `/logout?name=${localStorage.getItem(
        'name'
      )}&sessionID=${localStorage.getItem('sessionID')}`
    }
    let today = false
    let beforeToday = false
    let afterToday = false
    plans = sortDateReverse('date', 'time', plans)
    for (let i = 0; i < plans.length; i++) {
      const p = plans[i]
      createPlan(p.title, p.date, p.time, p.content, i)
      plansArr.push({
        title: p.title,
        date: p.date,
        time: p.time,
        content: p.content,
      })
      const cleanDate = new Date(p.date)
      if (
        `${
          todayDate.getMonth() + 1
        }/${todayDate.getDate()}/${todayDate.getFullYear()}` == plans[i].date ||
        !plans[i].date
      ) {
        today = true
      } else if (
        parseInt(
          `${todayDate.getFullYear()}${todayDate.getMonth() < 9 ? '0' : ''}${
            todayDate.getMonth() + 1
          }${todayDate.getDate() < 10 ? '0' : ''}${todayDate.getDate()}`
        ) >
        parseInt(
          `${cleanDate.getFullYear()}${cleanDate.getMonth() < 9 ? '0' : ''}${
            cleanDate.getMonth() + 1
          }${cleanDate.getDate() < 10 ? '0' : ''}${cleanDate.getDate()}`
        )
      ) {
        beforeToday = true
      } else {
        afterToday = true
      }
    }
    if (!today) {
      const noPlansTodayEl = document.createElement('div')
      noPlansTodayEl.innerHTML = 'No Plans Today'
      noPlansTodayEl.classList.add('noPlans')
      document
        .getElementById('planContainerWrapperToday')
        .appendChild(noPlansTodayEl)
    }
    if (!afterToday || !plans[0]) {
      const noPlansEl = document.createElement('div')
      noPlansEl.innerHTML = 'No More Plans'
      noPlansEl.classList.add('noPlans')
      document.getElementById('planContainerWrapper').appendChild(noPlansEl)
    }
    if (!beforeToday) {
      document.getElementById('oldPlans').classList.add('hidden')
    }
    document.querySelector('#createPlanContainer .name').value =
      localStorage.getItem('name')
    document.querySelector('#createPlanContainer .sessionID').value =
      localStorage.getItem('sessionID')
    //mobile
    if (document.documentElement.clientWidth < 450) {
      document.getElementById('createPlanBtn').classList.add('hidden')
      for (
        let i = 0;
        i < document.getElementsByClassName('planContainer').length;
        i++
      ) {
        document
          .getElementsByClassName('planContainer')
          [i].classList.add('mobile')
      }
      for (
        let i = 0;
        i < document.querySelectorAll('#createPlanContainer .info').length;
        i++
      ) {
        document
          .querySelectorAll('#createPlanContainer .info')
          [i].classList.remove('hidden')
      }
    }
  }
}

function createPlan(
  title = 'Plan',
  date = `${
    todayDate.getMonth() + 1
  }/${todayDate.getDate()}/${todayDate.getFullYear()}`,
  time = '00:00',
  content,
  index = 0
) {
  if (!title) title = 'Plan'
  if (!date) {
    date = `${
      todayDate.getMonth() + 1
    }/${todayDate.getDate()}/${todayDate.getFullYear()}`
  }
  if (!time) time = '00:00'
  let today = false
  let beforeToday = false
  time = timeConvert24To12(time)
  if (
    `${
      todayDate.getMonth() + 1
    }/${todayDate.getDate()}/${todayDate.getFullYear()}` == date
  ) {
    today = true
  }
  const cleanDate = new Date(date)
  if (
    parseInt(
      `${todayDate.getFullYear()}${todayDate.getMonth() < 9 ? '0' : ''}${
        todayDate.getMonth() + 1
      }${todayDate.getDate() < 10 ? '0' : ''}${todayDate.getDate()}`
    ) >
    parseInt(
      `${cleanDate.getFullYear()}${cleanDate.getMonth() < 9 ? '0' : ''}${
        cleanDate.getMonth() + 1
      }${cleanDate.getDate() < 10 ? '0' : ''}${cleanDate.getDate()}`
    )
  ) {
    beforeToday = true
  }
  const planContainerEl = document.createElement('div')
  planContainerEl.id = `planContainer${index}`
  planContainerEl.classList.add('itemContainer')
  planContainerEl.classList.add('planContainer')
  const openEl = document.createElement('div')
  openEl.id = `planContainerOpen${index}`
  openEl.classList.add('open')
  openEl.addEventListener('click', () => {
    openPlanFullScreen(index)
  })
  planContainerEl.appendChild(openEl)
  const closeEl = document.createElement('div')
  closeEl.classList.add('close')
  closeEl.innerHTML =
    '<svg class="closeSVG" width="25px" height="25px" viewBox="0 0 18 18"><path d="M2 16L16 2" /><path d="M2 2L16 16" /></svg>'
  closeEl.addEventListener('click', () => {
    closePlanFullScreen(index)
    history.back()
  })
  planContainerEl.appendChild(closeEl)
  const removeEl = document.createElement('div')
  removeEl.classList.add('remove')
  removeEl.innerHTML =
    '<svg class="removeSVG" width="25px" height="25px" viewBox="0 0 41.336 41.336" ><g><path d="M36.335,5.668h-8.167V1.5c0-0.828-0.672-1.5-1.5-1.5h-12c-0.828,0-1.5,0.672-1.5,1.5v4.168H5.001c-1.104,0-2,0.896-2,2 s0.896,2,2,2h2.001v29.168c0,1.381,1.119,2.5,2.5,2.5h22.332c1.381,0,2.5-1.119,2.5-2.5V9.668h2.001c1.104,0,2-0.896,2-2 S37.438,5.668,36.335,5.668z M14.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5 s1.5,0.672,1.5,1.5V35.67z M22.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5 s1.5,0.672,1.5,1.5V35.67z M25.168,5.668h-9V3h9V5.668z M30.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21 c0-0.828,0.672-1.5,1.5-1.5s1.5,0.672,1.5,1.5V35.67z"/></g></svg>'
  removeEl.addEventListener('click', () => {
    removePlan(index)
  })
  planContainerEl.appendChild(removeEl)
  const titleEl = document.createElement('div')
  titleEl.classList.add('title')
  titleEl.innerHTML = title
  planContainerEl.appendChild(titleEl)
  if (!today) {
    const dateEl = document.createElement('div')
    dateEl.classList.add('date')
    dateEl.innerHTML = date
    planContainerEl.appendChild(dateEl)
  }
  const timeEl = document.createElement('div')
  timeEl.classList.add('time')
  timeEl.innerHTML = time
  planContainerEl.appendChild(timeEl)
  const lineEl = document.createElement('div')
  lineEl.classList.add('line')
  planContainerEl.appendChild(lineEl)
  const spacerEl = document.createElement('div')
  spacerEl.classList.add('spacer-small')
  planContainerEl.appendChild(spacerEl)
  const contentEl = document.createElement('div')
  contentEl.classList.add('content')
  contentEl.innerHTML = content
  planContainerEl.appendChild(contentEl)
  if (today) {
    document
      .getElementById('planContainerWrapperToday')
      .appendChild(planContainerEl)
  } else if (beforeToday) {
    document
      .getElementById('planContainerWrapperBeforeToday')
      .appendChild(planContainerEl)
  } else {
    document.getElementById('planContainerWrapper').appendChild(planContainerEl)
  }
}

function openPlanFullScreen(index) {
  document.getElementById(`planContainer${index}`).classList.add('fullScreen')
  document.getElementById(`planContainerOpen${index}`).classList.add('hidden')
  document
    .getElementsByClassName('backgroundBlock')[0]
    .classList.remove('hidden')
  window.onpopstate = () => {
    closePlanFullScreen(index)
  }
  history.pushState({}, '')
  document
    .getElementsByClassName('backgroundBlock')[0]
    .parentNode.replaceChild(
      document.getElementsByClassName('backgroundBlock')[0].cloneNode(true),
      document.getElementsByClassName('backgroundBlock')[0]
    )
  document
    .getElementsByClassName('backgroundBlock')[0]
    .addEventListener('click', () => {
      closePlanFullScreen(index)
      history.back()
    })
}

function closePlanFullScreen(index) {
  document.getElementsByClassName('backgroundBlock')[0].classList.add('hidden')
  document
    .getElementById(`planContainer${index}`)
    .classList.remove('fullScreen')
  document
    .getElementById(`planContainerOpen${index}`)
    .classList.remove('hidden')
}

function openCreatePlanContainer() {
  document.getElementById('createPlanContainer').classList.remove('hidden')
  document
    .getElementsByClassName('backgroundBlock')[0]
    .classList.remove('hidden')
  window.onpopstate = () => {
    closeCreatePlanContainer()
  }
  history.pushState({}, '')
  document
    .getElementsByClassName('backgroundBlock')[0]
    .parentNode.replaceChild(
      document.getElementsByClassName('backgroundBlock')[0].cloneNode(true),
      document.getElementsByClassName('backgroundBlock')[0]
    )
  document
    .getElementsByClassName('backgroundBlock')[0]
    .addEventListener('click', () => {
      closeCreatePlanContainer()
      history.back()
    })
}

function closeCreatePlanContainer() {
  document.getElementsByClassName('backgroundBlock')[0].classList.add('hidden')
  document.getElementById('createPlanContainer').classList.add('hidden')
}

function removePlan(index) {
  const plan = plansArr[index]
  async function fetchRemovePlan(params) {
    let result = await fetch('/post/removePlan', {
      method: 'POST',
      body: `name=${params.name}&sessionID=${
        params.sessionID
      }&plan=${JSON.stringify(params.plan)}`,
    })
    let response = await result.json()
    if (response.data != 'Success') {
      location.href = `/error?e=${response.data}`
    } else {
      history.back()
      location.reload()
    }
  }
  fetchRemovePlan({
    name: localStorage.getItem('name'),
    sessionID: localStorage.getItem('sessionID'),
    plan: plan,
  })
}

function timeConvert24To12(time = '24:00') {
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
    time,
  ]
  if (time.length > 1) {
    time = time.slice(1)
    time[5] = +time[0] < 12 ? ' AM' : ' PM'
    time[0] = +time[0] % 12 || 12
  }
  return time.join('')
}

function sortDateReverse(property, property2, arr) {
  //bad bubble sort (don't copy)
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      let prop11 = arr[j + 1][property]
      let cleanProp11 = new Date(prop11)
      prop11 = parseInt(
        `${cleanProp11.getFullYear()}${cleanProp11.getMonth() < 9 ? '0' : ''}${
          cleanProp11.getMonth() + 1
        }${cleanProp11.getDate() < 10 ? '0' : ''}${cleanProp11.getDate()}`
      )
      let prop12 = arr[j][property]
      let cleanProp12 = new Date(prop12)
      prop12 = parseInt(
        `${cleanProp12.getFullYear()}${cleanProp12.getMonth() < 9 ? '0' : ''}${
          cleanProp12.getMonth() + 1
        }${cleanProp12.getDate() < 10 ? '0' : ''}${cleanProp12.getDate()}`
      )
      let prop21 = arr[j + 1][property2]
      prop21 = prop21.split(':').join('')
      let prop22 = arr[j][property2]
      prop22 = prop22.split(':').join('')
      if (prop11 > prop12) {
        ;[arr[j + 1], arr[j]] = [arr[j], arr[j + 1]]
      } else if (prop21 < prop22 && prop11 == prop12) {
        ;[arr[j + 1], arr[j]] = [arr[j], arr[j + 1]]
      }
    }
  }
  return arr
}

function reverseArr(str) {
  return str.split('').reverse().join('')
}

function getTimeText(todaysDate) {
  const hours = todaysDate.getHours()
  return hours < 12
    ? 'Good Morning'
    : hours < 19
    ? 'Good Afternoon'
    : hours < 22
    ? 'Good Evening'
    : 'Good Night'
}

function setTimeDateMsg() {
  document.getElementById(
    'dateTimeMsg'
  ).innerHTML = `<div id="dateTimeMsg-date">${
    todayDate.getMonth() + 1
  }/${todayDate.getDate()}/${todayDate.getFullYear()}</div><div id="dateTimeMsg-time">${
    todayDate.getHours() % 12 || 12
  }${
    todayDate.getSeconds() % 2 == 0
      ? '<a style="opacity: 0.2;">:</a>'
      : '<a style="opacity: 1;">:</a>'
  }${(todayDate.getMinutes() < 10 ? '0' : '') + todayDate.getMinutes()} ${
    todayDate.getHours() < 12 ? 'AM' : 'PM'
  }</div>`
}
