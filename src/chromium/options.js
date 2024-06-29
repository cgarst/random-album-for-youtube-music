function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
      album_shuffle_count: document.querySelector("#album_shuffle_count").value,
    });
  }
  
  function restoreOptions() {
    function setCurrentChoice(result) {
      document.querySelector("#album_shuffle_count").value = result.album_shuffle_count || "1";
    }
  
    function onError(error) {
      console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.sync.get("album_shuffle_count");
    getting.then(setCurrentChoice, onError);
  }
  
  document.addEventListener("DOMContentLoaded", restoreOptions);
  document.querySelector("form").addEventListener("submit", saveOptions);
  