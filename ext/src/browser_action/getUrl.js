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

function getScrapedCardsFromScrapedDetails(details) {
	var scrapedCards = [];
	for (i=0; i < details.length; i++) {
		scrapedCards[i] = {};
		scrapedCards[i].url = details[i].getElementsByTagName('a')[0].getAttribute('href');
		var values = details[i].getElementsByClassName('right');
		scrapedCards[i].value = values[0].innerText.replace(/[^0-9.]/g,'');
		scrapedCards[i].price = values[2].innerText.replace(/[^0-9.]/g,'');
	}
	return scrapedCards;
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

function loadXMLDoc(urlBeingPassed, functionBeingPassed) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			functionBeingPassed(xmlhttp);
		}
	};
	xmlhttp.open("GET", urlBeingPassed, true);
	xmlhttp.send();
}

function getDocFromXml(xml) {
	var xmlDoc = xml.responseText;
	parser = new DOMParser();
	xmlDoc = parser.parseFromString(xmlDoc,"text/html");
}

function getUrl()
{
	inputtedPurchasePrice = document.getElementById('purchasePriceTextBox').value
	inputtedPurchasePrice = inputtedPurchasePrice.replace(/[^0-9.]/g, ''); // sanitize input
	var domainName = "";
	chrome.tabs.query({ //This method output active URL 
		"active": true,
		"currentWindow": true,
		"status": "complete",
		"windowType": "normal"
	}, function (tabs) {
		for (tab in tabs) {
			var company = getCompanyName(tabs, tab);
			var companySearchUrl = "https://www.raise.com/buy-gift-cards?utf8=%E2%9C%93&keywords="+company+"&type=electronic";
			var firstPageOfCardsUrl = "";

			function myFunction(xml) {
				xmlDoc = getDocFromXml(xml);
				var href = xmlDoc.getElementsByClassName("product-source")[0].getElementsByTagName('a')[0].getAttribute('href');
				firstPageOfCardsUrl = "https://www.raise.com" + href + "&page=1&per=200"; // seems to be a 200 card limit unfortunately

				/* we must go deeper */
				
				var details = []

				function myFunction2(xml) {
					xmlDoc = getDocFromXml(xml);
					details = xmlDoc.getElementsByClassName('toggle-details');
					scrapeCardsAndCreateNewTab(details, firstPageOfCardsUrl);
				}

				loadXMLDoc(firstPageOfCardsUrl, myFunction2);

				function scrapeCardsAndCreateNewTab(details, firstPageOfCardsUrl) {
					var scrapedCards = getScrapedCardsFromScrapedDetails(details);
					// getting best card
					var finalUrl = getIdealCard(inputtedPurchasePrice, scrapedCards, firstPageOfCardsUrl);
					chrome.tabs.create({ url: finalUrl });
				}
			}
			loadXMLDoc(companySearchUrl, myFunction);
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