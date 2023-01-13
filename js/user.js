if (!loggedIn) {
  location.href = '/'
}

document
  .querySelector('#logoutBtn')
  .addEventListener("click", () => {
    location.href = `/logout?name=${localStorage.getItem(
      "name"
    )}&sessionID=${localStorage.getItem("sessionID")}`;
  });
document
  .querySelector('#logoutAllBtn')
  .addEventListener("click", function () {
    logoutAllPopUp();
  });

//userInfoContainer
document.getElementById('userInfo-username').innerHTML = localStorage.getItem('name').split('@')[0]
document.getElementById('userInfo-device').innerHTML = localStorage.getItem('name').split('@')[1]
document.getElementById('userInfo-fullUserName').innerHTML = localStorage.getItem('name')


async function logoutAll(password) {
    let result = await fetch('/post/logoutAll', {
      method: 'POST',
      body: `name=${
        localStorage.getItem('name').split('@')[0]
      }&password=${password}`,
    })
    if (result.url.endsWith('/')) localStorage.clear()
    location.href = result.url
  }
  
function logoutAllPopUp() {
    document.getElementById('logoutAllPopUp') &&
      document.getElementById('logoutAllPopUp').remove()

    const spacer0 = document.createElement('div')
    spacer0.classList.add('spacer-small')
    const spacer1 = document.createElement('div')
    spacer1.classList.add('spacer-small')
    const wrapper = document.createElement('div')
    wrapper.id = 'logoutAllPopUp'
    document.body.appendChild(wrapper)
    const innerWrapper = document.createElement('div')
    innerWrapper.classList.add('itemContainer')
    innerWrapper.classList.add('center')
    innerWrapper.classList.add('setWidth')
    wrapper.appendChild(innerWrapper)
    const inpContainer = document.createElement('div')
    inpContainer.classList.add('inpContainer')
    inpContainer.classList.add('center')
    inpContainer.classList.add('setWidth')
    innerWrapper.appendChild(inpContainer)
    const inp = document.createElement('input')
    inp.id = 'logoutAllPopUpInp'
    inp.type = 'password'
    inp.classList.add('inp')
    inp.placeholder = `Enter the password for ${
      localStorage.getItem('name').split('@')[0]
    }`
    inpContainer.appendChild(inp)
    const closeBtn = document.createElement('button')
    closeBtn.classList.add('btn')
    closeBtn.addEventListener('click', () => {
      location.reload()
    })
    closeBtn.innerHTML = 'Close'
    const submitBtn = document.createElement('button')
    submitBtn.classList.add('btn')
    submitBtn.innerHTML = 'Submit'
    submitBtn.addEventListener('click', () => {
      logoutAll(document.querySelector('#logoutAllPopUpInp').value)
    })
    inpContainer.appendChild(spacer0)
    inpContainer.appendChild(submitBtn)
    inpContainer.appendChild(spacer1)
    inpContainer.appendChild(closeBtn)
}

