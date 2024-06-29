// Set a default value for albums_to_pick
var albums_to_pick = 1;

// Retrieve the album_shuffle_count from storage
try {
  browser.storage.sync.get("album_shuffle_count").then((result) => {
    if (result.album_shuffle_count !== undefined) {
      albums_to_pick = result.album_shuffle_count;
    } else {
      console.error("Unexpected albums shuffle count value in storage. Using default value:", albums_to_pick);
    }
  }).catch((error) => {
    console.error("Error retrieving album shuffle count from storage:", error);
    console.log("Using default value:", albums_to_pick);
  });
} catch (error) {
  if (error instanceof ReferenceError && error.message.includes('browser is not defined')) {
    console.warn("Warning: browser is not defined, likely running in console");
  } else {
    console.error("Unexpected error:", error);
  }
}

console.log("Random Album for YouTube Music started with an album shuffle count of", albums_to_pick)

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
    //var albumsSelector = document.querySelector(albums_button_sel);


    // START TEST
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

// Function to continuously scroll to the bottom of the page until no more albums are loaded
function scrollAllAlbums() {
  let previousItemCount = 0;

  const scrollInterval = setInterval(() => {
    window.scrollTo(0, document.body.scrollHeight);
    const items = document.querySelectorAll(album_list_sel);
    var currentItemCount = items.length;

    if (currentItemCount === previousItemCount) {
      console.log('Finished scrolling with ' + currentItemCount + ' albums.')
      // Scroll back to top
      window.scrollTo(0, 0);
      clearInterval(scrollInterval);
      main(items);
    } else {
      console.log('Seeing ' + currentItemCount + ' albums, scrolling..')
      previousItemCount = currentItemCount;
    }
  }, sleep_short); // Adjust the interval time if needed
}

// Main function to count the albums, get a random list, and make the selections
async function main(items) {
  console.log('Total albums:', items.length);
  if (items.length > 0) {


    // Single select mode
    num = selectRandomNumber(items);
    var link = items[num].querySelector('a');
    console.log('Playing album', num, getAlbumName(link));
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
      console.log('Albums to be queued: ' + random_list)
      // Queue the list of albums
      for (let i = 0; i < random_list.length; i++) {
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
      await sleep(sleep_tiny);
    if (albums_to_pick === 1){
      // Leave the user viewing the album itself in this mode
      var link = items[num].querySelector('a');
      link.click();
    } else if (albums_to_pick > 1){
      // Open now playing screen when done queueing multiple
      //clickNowPlayingButton();
      console.log("Queued " + queue_count + " out of " + albums_to_pick + " attempted albums")
    }
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
  }
}


// Function to get album name from grid view
async function getAlbumName(grid_album_item) {
  var title = grid_album_item.getAttribute('title');
  return title;
}

// Function to simulate a right click
function rightClick(element) {
  if (!element) {
    console.error('Element not found with the selector:', selector);
    return;
  }

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


// Check the URL and initiate the process
init();