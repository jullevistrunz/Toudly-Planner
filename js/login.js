const nameInp = document.getElementById('nameInp')
const passwordInp = document.getElementById('passwordInp')
const submitBtn = document.getElementById('submitBtn')

function setSubmitBtnDisabled() {
  if (!nameInp.value || !passwordInp.value) {
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
  })
  passwordInp.addEventListener('input', () => {
    setSubmitBtnDisabled()
  })
}
