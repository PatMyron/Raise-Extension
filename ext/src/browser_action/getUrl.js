var details = [];
var inputtedPurchasePrice = "";
var firstPageOfCardsUrl = "";

function getCompanyName(tabs, tab) {
    var domainName = tabs[tab].url;
    domainName = domainName.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
    function getDomainName(hostName) {
        return hostName.substring(hostName.lastIndexOf(".", hostName.lastIndexOf(".") - 1) + 1);
    }

    var fullDomain = getDomainName(domainName);
    return fullDomain.split(".")[0];
}

function getScrapedCardsFromScrapedDetails(details) {
    var scrapedCards = [];
    for (var i = 0; i < details.length; i++) {
        scrapedCards[i] = {};
        scrapedCards[i].url = details[i].getElementsByTagName('a')[0].getAttribute('href');
        var values = details[i].getElementsByClassName('right');
        scrapedCards[i].value = values[0].innerText.replace(/[^0-9.]/g, '');
        scrapedCards[i].price = values[2].innerText.replace(/[^0-9.]/g, '');
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
    for (var card = 0; card < cards.length; card++) {
        var saved = Math.min(purchasePrice, cards[card].value) - cards[card].price;
        if (saved > maxSaved) {
            maxSaved = saved;
            maxSpot = card;
        }
    }

    if (maxSaved > 0) {
        urlSuffix = cards[maxSpot].url;
    }
    else {
        alert("No available cards that save money")
    }

    // good case
    return "https://www.raise.com" + urlSuffix;
}

function loadXMLDoc(urlBeingPassed, functionBeingPassed) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            functionBeingPassed(xmlhttp);
        }
    };
    xmlhttp.open("GET", urlBeingPassed, true);
    xmlhttp.send();
}

function getDocFromXml(xml) {
    var xmlDoc = xml.responseText;
    var parser = new DOMParser();
    return parser.parseFromString(xmlDoc, "text/html");
}

function scrapeCardsAndCreateNewTab(inputtedPurchasePrice, details, firstPageOfCardsUrl) {
    var scrapedCards = getScrapedCardsFromScrapedDetails(details);
    // getting best card
    var finalUrl = getIdealCard(inputtedPurchasePrice, scrapedCards, firstPageOfCardsUrl);
    chrome.tabs.create({url: finalUrl}); // opening new tab
}

function scrape2ndUrl(xml) {
    var xmlDoc = getDocFromXml(xml);
    details = xmlDoc.getElementsByClassName('toggle-details');
    scrapeCardsAndCreateNewTab(inputtedPurchasePrice, details, firstPageOfCardsUrl);
}

// main function
function getUrl() {
    inputtedPurchasePrice = document.getElementById('purchasePriceTextBox').value;
    inputtedPurchasePrice = inputtedPurchasePrice.replace(/[^0-9.]/g, ''); // sanitize input
    chrome.tabs.query({ // This method outputs active URL
        "active": true,
        "currentWindow": true,
        "status": "complete",
        "windowType": "normal"
    }, function (tabs) {
        for (var tab in tabs) {
            var company = getCompanyName(tabs, tab);
            if (hardCodes.hasOwnProperty(company)) {
                var urlsubstring = hardCodes[company];
                firstPageOfCardsUrl = "https://www.raise.com/buy-" + urlsubstring + "-gift-cards?type=electronic&page=1&per=200";
                loadXMLDoc(firstPageOfCardsUrl, scrape2ndUrl);
                return;
            }
            var companySearchUrl = "https://www.raise.com/buy-gift-cards?utf8=%E2%9C%93&keywords=" + company + "&type=electronic";

            function scrape1stUrl(xml) {
                var xmlDoc = getDocFromXml(xml);

                // TODO handle ones that don't need search
                if (xmlDoc.getElementsByClassName("product-source").length == 0) {
                    firstPageOfCardsUrl = "https://www.raise.com/buy-" + company + "-gift-cards?type=electronic&page=1&per=200";
                    loadXMLDoc(firstPageOfCardsUrl, scrape2ndUrl);
                }
                else {
                    var href = xmlDoc.getElementsByClassName("product-source")[0].getElementsByTagName('a')[0].getAttribute('href');
                    firstPageOfCardsUrl = "https://www.raise.com" + href + "&page=1&per=200"; // seems to be a 200 card limit unfortunately
                    loadXMLDoc(firstPageOfCardsUrl, scrape2ndUrl);
                }
            }

            loadXMLDoc(companySearchUrl, scrape1stUrl);
        }
    });
}

function clickHandler(e) {
    chrome.runtime.sendMessage({directive: "popup-click"}, function (response) {
        // this.close(); // close the popup when the background finishes processing request
        getUrl();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('button').addEventListener('click', clickHandler);
});

var hardCodes = {
    "bedbathandbeyond": "bed-bath-beyond",
    "wholefoodsmarket": "whole-foods",
    "tjx": "t-j-maxx-online-only",
    "ae": "american-eagle-outfitters",
    "regmovies": "regal-cinemas",
    "marshallsonline": "marshalls",
    "bathandbodyworks": "bath-body-works",
    "toysrus": "toys-r-us",
    "rossstores": "ross",
    "burlingtoncoatfactory": "burlington-coat-factory",
    "hm": "h-m",
    "barnesandnoble": "barnes-noble",
    "nyandcompany": "new-york-company",
    "babiesrus": "babies-r-us"
};