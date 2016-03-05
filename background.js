chrome.webRequest.onBeforeRequest.addListener(
	function(details)
	{
		var url = details.url;
		if (details.type != "xmlhttprequest")
		{
			if (url.indexOf("read.cgi") != -1) {
				url = chrome.extension.getURL("read.html") + "?" + url;
			} else if (url.indexOf("subback.html") != -1) {
				url = chrome.extension.getURL("subback.html") + "?" + url;
			} else if (url.indexOf("bbstable.html")!= -1) {
				url = chrome.extension.getURL("bbstable.html") + "?" + url;
			}
		}
		return {
			redirectUrl: url
		};
	},
	{
		urls: [
			"http://*.2ch.net/*",
			"http://*.2ch.sc/*"
		]
	},
	["blocking"]);
