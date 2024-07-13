// Set a default value for albums_to_pick
var albums_to_pick_default = 1;

// Compatibility layer for browser.* and chrome.* storage API calls
try {
  if (typeof browser === "undefined" && typeof chrome != "undefined") {
    var browser = (function () {
      return chrome;
    })();
  }
} catch (error) {
  console.warn("Warning: browser is not defined, likely running in console");
}

// Retrieve the album_shuffle_count from storage
try {
  browser.storage.sync.get("album_shuffle_count").then((result) => {
    if (result.album_shuffle_count !== undefined) {
      albums_to_pick = result.album_shuffle_count;
    } else {
      var albums_to_pick = albums_to_pick_default;
      console.warn("No albums shuffle count value in storage. Proceeding with default value:", albums_to_pick);
    }
  }).catch((error) => {
    console.error("Error retrieving album shuffle count from storage:", error);
    var albums_to_pick = albums_to_pick_default;
    console.warn("Using default album count:", albums_to_pick);
  });
} catch (error) {
  console.warn("Couldn't getting random album saved settings:", error);
  var albums_to_pick = albums_to_pick_default;
}

// Time to wait between clicks
var sleep_tiny = 10; // 10ms
var sleep_short = 1000; // 1 second
var sleep_long = 2000; // 2 seconds

// Define targets
var albums_url = 'https://music.youtube.com/library/albums';
var library_button_sel = 'ytmusic-guide-section-renderer.style-scope:nth-child(1) > div:nth-child(3) > ytmusic-guide-entry-renderer:nth-child(3)';
var albums_button_sel = 'ytmusic-chip-cloud-chip-renderer.style-scope:nth-child(4)';
var albums_button_sel_left = 'ytmusic-chip-cloud-chip-renderer.style-scope:nth-child(3)';
var album_list_sel = '[id^="items"] > ytmusic-two-row-item-renderer';
var now_playing_button_sel = 'ytmusic-player-bar.style-scope';
var queue_button_sel = 'ytmusic-menu-service-item-renderer.style-scope:nth-child(4)';
var grid_album_sel = 'a:nth-child(1)';
var grid_play_button_sel = 'a:nth-child(1) > ytmusic-item-thumbnail-overlay-renderer:nth-child(4) > div:nth-child(2) > ytmusic-play-button-renderer:nth-child(1)';
var blank_space = '.center-content';
var chip_links_sel = 'ytmusic-chip-cloud-chip-renderer > div > a';

// Global counters
var queue_count = 0;
var played_count = 0;
var first_album_done = false;

// Function to check if the current URL matches the target URL
function init() {
  if (window.location.href === albums_url) {
    scrollAllAlbums();
  } else {
    // Click the first selector if the URL is not the target URL
    clickLibrary();
  }
}

// Function to click the library button
function clickLibrary() {
  const librarySelector = document.querySelector(library_button_sel);
  if (librarySelector) {
    updateUserMessage("Navigating to the library page...");
    console.log('Navigating to the library page...');
    librarySelector.click();
    setTimeout(navToAlbumsPage, sleep_long);
  } else {
    console.log('Library selector not found');
  }
}

// Function to click the album button
async function navToAlbumsPage() {
  // Check if the current URL is the target URL before proceeding
  if (window.location.href === albums_url) {
    scrollAllAlbums();
  } else {
    updateUserMessage("Navigating to the albums page...");

    // Select the parent element with the CSS selector 'chips'
    const chips = document.querySelector('#chips');

    // Variables to store the selectors
    let clearFiltersSelector = null;
    let albumsSelector = null;

    // Check if the element exists
    if (chips) {
        // Get all children matching the hierarchy 'ytmusic-chip-cloud-chip-renderer > div > a'
        const chipLinks1 = chips.querySelectorAll(chip_links_sel);

        // Iterate over each 'a' element to find 'Clear filters'
        for (let link of chipLinks1) {
            var title = link.getAttribute('title');

            // Check if the title attribute is 'Clear filters'
            if (title === 'Clear filters') {
                clearFiltersSelector = link;
                break; // Break out of the loop
            }
        }

        // Click the 'Clear filters' element if found
        if (clearFiltersSelector) {
            clearFiltersSelector.click();
            console.log('Clicked the "Clear filters" selector.');
            await sleep(sleep_short);
        }

        await sleep(sleep_short);
        const chips2 = document.querySelector('#chips');
        const chipLinks2 = chips2.querySelectorAll(chip_links_sel);
        // Iterate again over each 'a' element again to find 'Show albums'
        for (let link of chipLinks2) {
            var title = link.getAttribute('title');

            // Check if the title attribute is 'Show albums'
            if (title === 'Show albums') {
                albumsSelector = link;
                break; // Break out of the loop
            }
        }

        // Log the selectors if found
        if (albumsSelector) {
            console.log('Found the "Show albums" selector:', albumsSelector);
        } else {
            console.error('No "Show albums" selector found.', chipLinks2);
        }
    } else {
        console.log('No elements found with the CSS selector "chips".');
    }

    console.log('Navigating to the albums page...');
    albumsSelector.click();
    await sleep(sleep_long);
    scrollAllAlbums();
  }
}

// Function to continuously scroll to the bottom of the page until double checking that no more albums are loading on scroll
function scrollAllAlbums() {  

  let previousItemCount = 0;
  let x2previousItemCount = 0;

  updateUserMessage("Scrolling through all albums...")

  const scrollInterval = setInterval(() => {
    window.scrollTo(0, document.body.scrollHeight);
    const items = document.querySelectorAll(album_list_sel);
    var currentItemCount = items.length;

    if (currentItemCount === previousItemCount && x2previousItemCount === previousItemCount) {
      console.log('Finished scrolling with ' + currentItemCount + ' albums.')
      // Scroll back to top
      window.scrollTo(0, 0);
      clearInterval(scrollInterval);
      main(items);
    } else {
      console.log('Seeing ' + currentItemCount + ' albums, scrolling..')
      x2previousItemCount = previousItemCount;
      previousItemCount = currentItemCount;
    }
  }, sleep_short);
}

// Main function to count the albums, get a random list, and make the selections
async function main(items) {
  console.log('Total albums:', items.length);
  if (items.length > 0) {
    console.log("Processing an album shuffle count of", albums_to_pick)

    // Single select mode
    updateUserMessage("Selecting a random album...");
    num = selectRandomNumber(items);
    var link = items[num].querySelector('a');
    console.log('Playing album', num, getAlbumName(link));
    updateUserMessage('Playing album #' + num + ' of ' + items.length);
    await sleep(sleep_short);
    clickPlayButtonFromGrid(items[num]);


    // Multi select mode
    if (albums_to_pick > 1) {
      while (first_album_done != true) {
        await sleep(sleep_short);
      }
      // Subtract the album already playing from the remaining count
      var remaining_albums = albums_to_pick - 1
      var links = []
      var random_list = []
      while (links.length < remaining_albums) {
        num = selectRandomNumber(items);
        links.push(link);
        random_list.push(num);
      }
      console.log('Album IDs to be queued: ' + random_list)
      // Queue the list of albums
      for (let i = 0; i < random_list.length; i++) {
        let user_count = i + 2
        updateUserMessage("Queueing album #" + random_list[i] + " of " + items.length + " (" + user_count + "/" + albums_to_pick + ")");
        await sleep(sleep_short);
        var link = items[random_list[i]].querySelector('a');
        console.log('Queueing album', random_list[i], getAlbumName(link));
        rightClick(link);
        await sleep(sleep_short);
        clickQueueButton();
        document.querySelector(blank_space).click();
        await sleep(sleep_short);
      }
    }

    // Open the final screen
    if (albums_to_pick === 1){
      // End at the album screen during single-select
      while (played_count < 1) {
        await sleep(sleep_long);
        console.log("Waiting for grid play button click to fire.")
      }
      var link = items[num].querySelector('a');
      link.click();
    } else if (albums_to_pick > 1){
      // End at the playing screen during multi-select
      console.log("Queued " + queue_count + " out of " + albums_to_pick + " attempted albums")
      clickNowPlayingButton();
    }
    hideLoading();
  } else {
    console.log('No albums found');
  }
}

// Function to click the now playing page button
function clickNowPlayingButton() {
  const now_playing_button = document.querySelector(now_playing_button_sel);
  if (now_playing_button) {
    now_playing_button.click();
  } else {
    console.log('Now playing button not found');
  }
}

// Function to click the queue option
function clickQueueButton() {
  const queue_button = document.querySelector(queue_button_sel);
  if (queue_button) {
    queue_button.click();
    ++queue_count;
  } else {
    console.log('Queue button not found');
  }
}

// Function to select random item
function selectRandomNumber(items) {
  // Generate a random index between 0 and the total number of items
  var randomIndex = Math.floor(Math.random() * items.length);
  // Shift from zero index
  ++randomIndex
  return randomIndex
}

// Function to play first album from grid view
async function clickPlayButtonFromGrid(grid_album_item) {
  grid_album_item.scrollIntoView();
  await sleep(sleep_short);
  mouseOver(grid_album_item);
  await sleep(sleep_long);
  var grid_play_button = grid_album_item.querySelector(grid_play_button_sel);
  if (!grid_play_button) {
    console.log('No grid play button for item number ' + num, grid_album_item);
  } else {
    grid_play_button.click();
    first_album_done = true;
    ++queue_count;
    ++played_count;
  }
}


// Function to get album name from grid view
async function getAlbumName(grid_album_item) {
  //var title = grid_album_item.getAttribute('title');
  var titlePromise = grid_album_item.getAttribute('title');
  var title = await titlePromise;
  return title;
}

// Function to simulate a right click
function rightClick(element) {
  // Scroll to the element first
  element.scrollIntoView();

  // Fire right click
  var event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    view: window,
    button: 2
  });

  element.dispatchEvent(event);
}

// Function to simulate a mouse over
function mouseOver(element) {
  const event = new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      view: window
  });

  element.dispatchEvent(event);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to create and append the overlay to the body
function createLoadingOverlay() {
  // Create the style element for CSS
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    .dim-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      visibility: hidden;
    }

    .loading-message {
      color: white;
      font-size: 20px;
      background: rgba(0, 0, 0, 0.8);
      padding: 20px;
      border-radius: 5px;
    }
  `;
  document.head.appendChild(style);

  // Create the overlay div
  var overlay = document.createElement('div');
  overlay.id = 'dimOverlay';
  overlay.className = 'dim-overlay';

  // Create the loading message div
  var message = document.createElement('div');
  message.id = 'loadingMessage';
  message.className = 'loading-message';
  message.innerText = 'Preparing for random album selection...';

  // Append the message to the overlay
  overlay.appendChild(message);

  // Append the overlay to the body
  document.body.appendChild(overlay);
}

// Functions to show and hide the overlay
function showLoading() {
  document.getElementById('dimOverlay').style.visibility = 'visible';
}

function hideLoading() {
  document.getElementById('dimOverlay').style.visibility = 'hidden';
}

// Function to update the message
function updateUserMessage(newMessage) {
  document.getElementById('loadingMessage').innerText = newMessage;
}

// Bake-in the dimmed overlay and display it
createLoadingOverlay();
showLoading();

// Check the URL and initiate the process
init();