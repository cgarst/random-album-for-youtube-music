// Time to wait between clicks
var timeout_short = 500
var timeout_long = 1000

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
      countAlbumsAndClickRandom(items);
    } else {
      previousItemCount = currentItemCount;
    }
  }, timeout_short); // Adjust the interval time if needed
}

// Function to count the number of available albums and click a random one
function countAlbumsAndClickRandom(items) {
  console.log('Total albums:', items.length);
  if (items.length > 0) {
    // Generate a random index between 0 and the total number of items - 1
    const randomIndex = Math.floor(Math.random() * items.length);
    console.log('Random selection:', randomIndex)
    // Get the link within the random item
    const link = items[randomIndex].querySelector('a');
    if (link) {
      // Click the link
      link.click();
      setTimeout(clickPlayButton, timeout_short);
    } else {
      console.log('No link found in the random album');
    }
  } else {
    console.log('No albums found');
  }
}

// Function to click the play button
function clickPlayButton() {
  const playButton = document.querySelector('#top-level-buttons > yt-button-renderer > yt-button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill');
  if (playButton) {
    playButton.click();
  } else {
    console.log('Play button not found');
  }
}

// Check the URL and initiate the process
checkURLAndInitiate();
