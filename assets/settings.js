function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        active: document.querySelector("#active").checked
    });
}
  
function restoreOptions() {  
    function setCurrentChoice(result) {
        document.querySelector("#active").checked = result.active || false;
    }
  
    function onError(error) {
        console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.sync.get("active");
    getting.then(setCurrentChoice, onError);
}
  
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("change", saveOptions);