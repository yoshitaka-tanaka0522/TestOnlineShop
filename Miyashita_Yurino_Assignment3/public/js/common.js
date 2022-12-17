// Save key (key for browsing or not) in sessionStorage
// If you are not browsing, set browsing to true
// Save the page every time the page changes in localStorage
// If the page was stored in localStorage when there was no sessionStorage key, redirect to it
const browse = sessionStorage.getItem('browse');
if(browse === null) {
  // when you first see the page
  sessionStorage.setItem('browse', true);
  const page = localStorage.getItem('page');
  // When I left and came back
  if(page !== null) {
    location.replace(page);
  }
}
// Save current page
localStorage.setItem('page', location.href);
