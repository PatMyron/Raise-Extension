var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-58135639-4']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {

		switch (request.directive) {
			chrome.pageAction.show(sender.tab.id);
			sendResponse();
		});