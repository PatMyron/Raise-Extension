function getUrl()
{
    return "http://www.google.com";
}

function clickHandler(e) {
    chrome.runtime.sendMessage({directive: "popup-click"}, function(response) {
        this.close(); // close the popup when the background finishes processing request
var newURL = "http://stackoverflow.com/";
  chrome.tabs.create({ url: newURL });
      });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('button').addEventListener('click', clickHandler);
})