/**
 * Created by pmyron on 2/9/16.
 */

 /* PART 1 */


// geting domain name (company name)
function getDomainName(hostName)
{
  return hostName.substring(hostName.lastIndexOf(".", hostName.lastIndexOf(".") - 1) + 1);
}
var fullDomain = getDomainName(window.location.hostname);
var company = fullDomain.split(".")[0];

this.document.location = "https://www.raise.com/buy-gift-cards?utf8=%E2%9C%93&keywords="+company+"&type=electronic";







/* PART 2 */

// getting the page on raise.com

var href = document.getElementsByClassName("product-source")[0].getElementsByTagName('a')[0].getAttribute('href');

url2 = href+"&page=1&per=200";
url2 = url2.substring(1); // removing leading slash
//this.document.location = "https://www.raise.com"+href+"&page=1&per=200";





var details = []
function loadXMLDoc() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      myFunction(xmlhttp);
    }
  };
  xmlhttp.open("GET", url2, true);
  xmlhttp.send();
}
function myFunction(xml) {
  var x, i, xmlDoc, txt;
  xmlDoc = xml.responseText;
  parser = new DOMParser();
  xmlDoc = parser.parseFromString(xmlDoc,"text/html");
  details = xmlDoc.getElementsByClassName('toggle-details');
  part3();
}

loadXMLDoc();




/* PART 3 */

// getting cards

function part3() {

  var scrapedCards = [];
// var details = document.getElementsByClassName('toggle-details');
for (i=0; i < details.length; i++) {
  scrapedCards[i] = {};
  scrapedCards[i].url = details[i].getElementsByTagName('a')[0].getAttribute('href');
  var values = details[i].getElementsByClassName('right');
  scrapedCards[i].value = values[0].innerText.replace(/[^0-9.]/g,'');
  scrapedCards[i].price = values[2].innerText.replace(/[^0-9.]/g,'');
}

// getting best card

function getIdealCard(purchasePrice, cards) {
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

var url = getIdealCard(100, scrapedCards); // hardcoded 100
this.document.location = "https://www.raise.com" + url;

}