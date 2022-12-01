const nameInp = document.getElementById('nameInp')
const passwordInp = document.getElementById('passwordInp')
const submitBtn = document.getElementById('submitBtn')

function setSubmitBtnDisabled() {
  if (
    !nameInp.value.match(/^[a-zA-Z0-9_.-]*$/) ||
    !passwordInp.value.match(/^[a-zA-Z0-9_.-]*$/) ||
    nameInp.value.length < 4 ||
    passwordInp.value.length < 6
  ) {
    submitBtn.disabled = true
  } else {
    submitBtn.disabled = false
  }
}

//from navbar
if (loggedIn) {
  setSubmitBtnDisabled()
  document
    .getElementById('inpErrorInfo-submitBtn-logout')
    .classList.remove('hidden')
} else {
  nameInp.addEventListener('input', () => {
    setSubmitBtnDisabled()
    if (!nameInp.value.match(/^[a-zA-Z0-9_.-]*$/)) {
      document
        .getElementById('inpErrorInfo-nameInp-invalidChar')
        .classList.remove('hidden')
    } else {
      document
        .getElementById('inpErrorInfo-nameInp-invalidChar')
        .classList.add('hidden')
    }

    if (nameInp.value.length < 4) {
      document
        .getElementById('inpErrorInfo-nameInp-tooShort')
        .classList.remove('hidden')
    } else {
      document
        .getElementById('inpErrorInfo-nameInp-tooShort')
        .classList.add('hidden')
    }

    if (!nameInp.value.match(/^[a-zA-Z0-9_.-]*$/) || nameInp.value.length < 4) {
      nameInp.classList.add('error')
    } else {
      nameInp.classList.remove('error')
    }
  })
  passwordInp.addEventListener('input', () => {
    setSubmitBtnDisabled()
    if (!passwordInp.value.match(/^[a-zA-Z0-9_.-]*$/)) {
      document
        .getElementById('inpErrorInfo-passwordInp-invalidChar')
        .classList.remove('hidden')
    } else {
      document
        .getElementById('inpErrorInfo-passwordInp-invalidChar')
        .classList.add('hidden')
    }

    if (passwordInp.value.length < 6) {
      document
        .getElementById('inpErrorInfo-passwordInp-tooShort')
        .classList.remove('hidden')
    } else {
      document
        .getElementById('inpErrorInfo-passwordInp-tooShort')
        .classList.add('hidden')
    }

    if (
      !passwordInp.value.match(/^[a-zA-Z0-9_.-]*$/) ||
      passwordInp.value.length < 6
    ) {
      passwordInp.classList.add('error')
    } else {
      passwordInp.classList.remove('error')
    }
  })
}
