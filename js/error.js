const query = new URLSearchParams(window.location.search)

if (query.get('e')) {
  document.getElementById('errorCode').innerHTML = `${query.get('e')}`
}
