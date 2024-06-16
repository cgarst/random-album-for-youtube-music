// Time to wait between clicks
var timeout_short = 1000
var timeout_long = 2000

// Function to check if the current URL matches the target URL
function checkURLAndInitiate() {
  if (window.location.href === 'https://music.youtube.com/library/albums') {
    scrollAllAlbums();
  } else {
    // Click the first selector if the URL is not the target URL
    clickLibrary();
  }
}

// Function to click the library button
function clickLibrary() {
  const librarySelector = document.querySelector('#items > ytmusic-guide-entry-renderer:nth-child(3) > tp-yt-paper-item');
  if (librarySelector) {
    console.log('Navigating to the library page...');
    librarySelector.click();
    setTimeout(clickAlbums, timeout_long);
  } else {
    console.log('Library selector not found');
  }
}

// Function to click the album button
function clickAlbums() {
  // Check if the current URL is the target URL before proceeding
  if (window.location.href === 'https://music.youtube.com/library/albums') {
    scrollAllAlbums();
  } else {
    const albumsSelector = document.querySelector('#chips > ytmusic-chip-cloud-chip-renderer:nth-child(4) > div > a');
    if (albumsSelector) {
    console.log('Navigating to the albums page...');
      albumsSelector.click();
      setTimeout(scrollAllAlbums, timeout_short);
    } else {
      console.log('Album selector not found');
    }
  }
}

// Function to continuously scroll to the bottom of the page until no more albums are loaded
function scrollAllAlbums() {
  let previousItemCount = 0;

  const scrollInterval = setInterval(() => {
    window.scrollTo(0, document.body.scrollHeight);
    const items = document.querySelectorAll('[id^="items"] > ytmusic-two-row-item-renderer');
    const currentItemCount = items.length;

    if (currentItemCount === previousItemCount) {
      clearInterval(scrollInterval);
    } else {
      previousItemCount = currentItemCount;
    }
  }, timeout_short); // Adjust the interval time if needed
}

checkURLAndInitiate();
completion();