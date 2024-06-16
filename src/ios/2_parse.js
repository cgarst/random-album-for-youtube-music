var result = []

const items = document.querySelectorAll('[id^="items"] > ytmusic-two-row-item-renderer');

console.log('Total albums:', items.length);
if (items.length > 0) {
for (let i = 1; i < items.length; i++) {
    const albumATag = document.querySelectorAll('[id^="items"] > ytmusic-two-row-item-renderer.style-scope:nth-child(' + i + ') > a:nth-child(1)')[0];
    const albumHref = albumATag.getAttribute('href');
    const albumTitle = albumATag.getAttribute('title');
    result.push({
    "title": albumTitle, 
    "url": albumHref
    })
}
} else {
console.log('No albums found');
}

console.log(result);
completion(result);