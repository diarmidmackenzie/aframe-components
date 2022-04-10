// This is run when the page is loaded, to customize the scene based on URL parameters.
// Assumes CONFIG global variable is alredy declared.

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const giftUrl = urlParams.get('gift-url')
const boxColor = urlParams.get('box-color')
const ribbonColor = urlParams.get('ribbon-color')
const message = urlParams.get('message')

if (boxColor) {
    CONFIG.boxColor = "#" + boxColor
}

if (ribbonColor) {
    CONFIG.ribbonColor = "#" + ribbonColor
}

if (giftUrl) {
    CONFIG.giftUrl = giftUrl;
}

if (message) {
    CONFIG.message = message;    
}
