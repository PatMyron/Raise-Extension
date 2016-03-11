function getCompanyName(tabs, tab) {
	domainName = tabs[tab].url;
	domainName = domainName.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
	function getDomainName(hostName)
	{
		return hostName.substring(hostName.lastIndexOf(".", hostName.lastIndexOf(".") - 1) + 1);
	}
	var fullDomain = getDomainName(domainName);
	return fullDomain.split(".")[0];
}

function getIdealCard(purchasePrice, cards, cardsPageUrl) {
	// handling empty price input
						
	if (purchasePrice == "") {
		return "https://www.raise.com" + cardsPageUrl.substring(21);
	}

	var urlSuffix = "";

	var maxSaved = 0;
	var maxSpot = -1;
	for (card = 0; card < cards.length; card++) {
		var saved = Math.min(purchasePrice, cards[card].value) - cards[card].price;
		if (saved > maxSaved) {
			maxSaved = saved;
			maxSpot = card;
		}
	}

	if (maxSaved > 0) {
		urlSuffix = cards[maxSpot].url;
	}

	// TODO handle case of no good card

	// good case
	var finalUrl = "https://www.raise.com" + urlSuffix;

	return finalUrl;
}

function getUrl()
{
	var inputtedPurchasePrice = document.getElementById('purchasePriceTextBox').value
	inputtedPurchasePrice = inputtedPurchasePrice.replace(/[^0-9.]/g, '');
	var domainName = "";
	chrome.tabs.query({ //This method output active URL 
		"active": true,
		"currentWindow": true,
		"status": "complete",
		"windowType": "normal"
	}, function (tabs) {
		for (tab in tabs) {
			var company = getCompanyName(tabs, tab);

			var url1 = "https://www.raise.com/buy-gift-cards?utf8=%E2%9C%93&keywords="+company+"&type=electronic";
			
			var url2 = "";
			function loadXMLDoc() {
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange = function() {
					if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
						myFunction(xmlhttp);
					}
				};
				xmlhttp.open("GET", url1, true);
				xmlhttp.send();
			}
			function myFunction(xml) {
				var xmlDoc = xml.responseText;
				parser = new DOMParser();
				xmlDoc = parser.parseFromString(xmlDoc,"text/html");
				var href = xmlDoc.getElementsByClassName("product-source")[0].getElementsByTagName('a')[0].getAttribute('href');
				url2 = href+"&page=1&per=200"; // seems to be a 200 card limit unfortunately
				url2 = "https://www.raise.com" + url2;


				/* we must go deeper */
				
				var details = []
				function loadXMLDoc2() {
					var xmlhttp = new XMLHttpRequest();
					xmlhttp.onreadystatechange = function() {
						if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
							myFunction2(xmlhttp);
						}
					};
					xmlhttp.open("GET", url2, true);
					xmlhttp.send();
				}
				function myFunction2(xml) {
					var xmlDoc = xml.responseText;
					parser = new DOMParser();
					xmlDoc = parser.parseFromString(xmlDoc,"text/html");
					details = xmlDoc.getElementsByClassName('toggle-details');
					scrapeCardsAndCreateNewTab(url2);
				}

				loadXMLDoc2();

				function scrapeCardsAndCreateNewTab(firstPageOfCardsUrl) {
					var scrapedCards = [];
					for (i=0; i < details.length; i++) {
						scrapedCards[i] = {};
						scrapedCards[i].url = details[i].getElementsByTagName('a')[0].getAttribute('href');
						var values = details[i].getElementsByClassName('right');
						scrapedCards[i].value = values[0].innerText.replace(/[^0-9.]/g,'');
						scrapedCards[i].price = values[2].innerText.replace(/[^0-9.]/g,'');
					}

					// getting best card
					var finalUrl = getIdealCard(inputtedPurchasePrice, scrapedCards, url2);

					chrome.tabs.create({ url: finalUrl });
				}
			}
			loadXMLDoc();
		}
	});
}

function clickHandler(e) {
	chrome.runtime.sendMessage({directive: "popup-click"}, function(response) {
        // this.close(); // close the popup when the background finishes processing request
        getUrl();
    });
}

document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('button').addEventListener('click', clickHandler);
})