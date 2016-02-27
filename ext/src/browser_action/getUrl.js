function getUrl()
{
	var domainName = "";
	chrome.tabs.query({ //This method output active URL 
		"active": true,
		"currentWindow": true,
		"status": "complete",
		"windowType": "normal"
	}, function (tabs) {
		for (tab in tabs) {
			domainName = tabs[tab].url;
			domainName = domainName.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
			function getDomainName(hostName)
			{
				return hostName.substring(hostName.lastIndexOf(".", hostName.lastIndexOf(".") - 1) + 1);
			}
			var fullDomain = getDomainName(domainName);
			var company = fullDomain.split(".")[0];
			var newURL = "https://www.raise.com/buy-gift-cards?utf8=%E2%9C%93&keywords="+company+"&type=electronic";
			chrome.tabs.create({ url: newURL });
		}
	});
}

function clickHandler(e) {
	chrome.runtime.sendMessage({directive: "popup-click"}, function(response) {
        this.close(); // close the popup when the background finishes processing request
        getUrl();
    });
}

document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('button').addEventListener('click', clickHandler);
})