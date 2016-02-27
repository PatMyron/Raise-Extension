function getUrl()
{
	var inputtedPurchasePrice = document.getElementById('purchasePriceTextBox').value
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
				var x, i, xmlDoc, txt;
				xmlDoc = xml.responseText;
				parser = new DOMParser();
				xmlDoc = parser.parseFromString(xmlDoc,"text/html");
				var href = xmlDoc.getElementsByClassName("product-source")[0].getElementsByTagName('a')[0].getAttribute('href');
				url2 = href+"&page=1&per=200";
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
					var x, i, xmlDoc, txt;
					xmlDoc = xml.responseText;
					parser = new DOMParser();
					xmlDoc = parser.parseFromString(xmlDoc,"text/html");
					details = xmlDoc.getElementsByClassName('toggle-details');
					part3(url2);
				}

				loadXMLDoc2();

				function part3(url2) {

					var scrapedCards = [];
					for (i=0; i < details.length; i++) {
						scrapedCards[i] = {};
						scrapedCards[i].url = details[i].getElementsByTagName('a')[0].getAttribute('href');
						var values = details[i].getElementsByClassName('right');
						scrapedCards[i].value = values[0].innerText.replace(/[^0-9.]/g,'');
						scrapedCards[i].price = values[2].innerText.replace(/[^0-9.]/g,'');
					}

					// getting best card

					function getIdealCard(purchasePrice, cards) {
						if (purchasePrice == "") {
							return url2.substring(21);
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

						return urlSuffix;
					}

					var url3 = getIdealCard(inputtedPurchasePrice, scrapedCards);
					var finalUrl = "https://www.raise.com" + url3;

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