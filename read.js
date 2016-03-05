var regUrl = /(https|http|ttps|ttp):\/\/([!#-%'-;=?-~]+)/g;
var regAnchor = /(?:(?:(?:&gt;)|��){1,2}|��|�t)([0-9�O-�X]+(?:[\-�\�]�`�|��][0-9�O-�X]+)?(?:[,�A�C][0-9�O-�X]+(?:[\-�\�]�`�|��][0-9�O-�X]+)?)*)/g;
var regAnchorHead = /^(?:(?:(?:&gt;)|��){1,2}|��|�t)/;
var regAnchorHyphen = /[\-�\�]�`�|��]/;
var regAnchorComma = /[,�A�C]/;

var posts;

document.addEventListener("DOMContentLoaded", init);

function Post(number, name, mail, info, comment, title)
{
	this.number = number;
	this.name = name;
	this.mail = mail;
	this.info = info;
	this.comment = comment;
	this.title = title;
	this.refAnchor = null;
}

function getPostFromDatLine(line, number)
{
	var splitted = line.split("<>");
	if (splitted.length != 5) {
		throw new Error("DAT �t�@�C���� " + number + " �s�ڂɕs���ȃf�[�^ (" + line + ") ���܂܂�Ă��܂��B");
	}
	var name = splitted[0] + "oppekepee";
	var mail = splitted[1];
	var info = splitted[2];
	var comment = splitted[3].replace(/<a href=".+?">(\&gt;\&gt;[\d\-]+)<\/a>/g, "$1");
	var title = splitted[4];
	return new Post(number, name, mail, info, comment, title);
}

function getPostsFromDat(data)
{
	var posts = new Array();
	var lines = data.split("\n");
	for (var i = 0; i < lines.length; i++) {
		if (lines[i].length == 0) {
			continue;
		}
		var number = i + 1;
		posts[number] = getPostFromDatLine(lines[i], number);
	}
	setRefAnchor(posts);
	return posts;
}

function setRefAnchor(posts) {
	for (var n = 1; n < posts.length; n++) {
		posts[n].refAnchor = new Array();
	}
	for (var n = 1; n < posts.length; n++) {
		var numbers = getAnchorNumbersFromComment(posts[n].comment);
		posts[n].comment += "[" + numbers.join(",") + "]";
		for (var i = 0; i < numbers.length; i++) {
			if (posts[numbers[i]] != undefined) {
				posts[numbers[i]].refAnchor.push(n);
			}
		}
	}
}

function getAnchorNumbersFromComment(comment)
{
	var matches = comment.match(regAnchor);
	if (matches == null) {
		return new Array();
	}
	var numbers = new Array();
	for (var i = 0; i < matches.length; i++) {
		var result = getAnchorNumbersFromAnchor(matches[i]);
		for (var j = 0; j < result.length; j++) {
			numbers.push(result[j]);
		}
	}
	numbers = numbers.filter((x, i, self) => self.indexOf(x) == i);
	if (numbers.length > 10) {
		numbers = numbers.slice(0, 10);
	}
	numbers.sort((a, b) => a - b);
	return numbers;
}

function getAnchorNumbersFromAnchor(anchor)
{
	var numbers = new Array();
	var csv = anchor.replace(regAnchorHead, "").split(regAnchorComma);
	for (var i = 0; i < csv.length; i++) {
		var hsv = csv[i].split(regAnchorHyphen)
		                .map(value => value.replace(/[�O-�X]/g, c => String("�O�P�Q�R�S�T�U�V�W�X".indexOf(c))));
		if (hsv.length == 1) {
			numbers.push(parseInt(hsv[0]));
		} else if (hsv.length == 2) {
			var n1 = parseInt(hsv[0]);
			var n2 = parseInt(hsv[1]);
			var min = Math.min(n1, n2);
			var max = Math.max(n1, n2);
			var count = 0;
			for (var n = min; n <= max; n++) {
				numbers.push(n);
				count++;
				if (count >= 10) {
					break;
				}
			}
		} else {
			throw Error("�A���J�[�̉�͂Ɏ��s���܂����B");
		}
	}
	numbers = numbers.filter((x, i, self) => self.indexOf(x) == i);
	if (numbers.length > 10) {
		numbers = numbers.slice(0, 10);
	}
	numbers.sort((a, b) => a - b);
	return numbers;
}

function init()
{
	var threadUrl = location.search.substring(1);
	$("#srcurl").text(threadUrl).attr("href", threadUrl);
	var datUrl = getDatUrlFromThreadUrl(threadUrl);
	$.get(datUrl, onDatRequestComplete).error(onDatRequestError);
}

function getDatUrlFromThreadUrl(threadUrl)
{
	var matched = threadUrl.match(/http:\/\/(.+?)\.(.+?)\/test\/read\.cgi\/(.+?)\/(\d+)/);
	if (matched == null) {
		throw new Error("�w�肳�ꂽ�X���b�h�� URL (" + threadUrl + ") ���� DAT �t�@�C���� URL ���擾�ł��܂���B");
	}
	var server = matched[1];
	var site = matched[2];
	var board = matched[3];
	var thread = matched[4];
	if (site == "2ch.net") {
		site = "2ch.sc";
	}
	return "http://" + server + "." + site + "/" + board + "/dat/" + thread + ".dat";
}

function onDatRequestComplete(data)
{
	posts = getPostsFromDat(data);
	$("#message").hide();
	$("#threadtitle").html(posts[1].title);
	var $dl = $("#posts");
	for (var n = 1; n < posts.length; n++) {
		var $dt = $createDefTermFromPost(posts[n]);
		var $dd = $createDefDescFromPost(posts[n]);
		$dl.append($dt).append($dd);
	}
}

function onDatRequestError()
{
	document.title = "�G���[";
	$("#message").text("DAT �t�@�C���̓ǂݍ��݂Ɏ��s���܂����B");
}

function $createDefTermFromPost(post)
{
	var number = "<a id=\"post" + post.number + "\">" + post.number + "</a>";
	var name;
	if (post.mail.length == 0) {
		name = "<span class=\"username\"><b>" + post.name + "</b></span>";
	} else {
		name = "<span class=\"username\"><a href=\"mailto:" + post.mail + "\"><b>" + post.name + "</b></a></span>"
	}
	var mail = post.mail;
	var info = post.info;
	var html = number + " ���O�F" + name + "[" + mail + "] ���e���F" + info + "[" + post.refAnchor.join(",") + "]";
	var $dt = $("<dt>").html(html);
	return $dt;
}

function $createDefDescFromPost(post)
{
	var html;
	if (!includesUnsafeTag(post.comment)) {
		html = post.comment.replace(regUrl, $createDefDescFromPost_linkReplacement);
	} else {
		html = post.comment;
	}
	html = html.replace(regAnchor, $createDefDescFromPost_anchorReplacement);
	var $dd = $("<dd>");
	$dd.html(html + "<br><br>");
	var $anchors = $dd.children(".anchor");
	for (var i = 0; i < $anchors.length; i++) {
		var $anchor = $anchors.eq(i);
		$anchor.attr("popupid", "");
		$anchor.mouseover(onAnchorMouseover);
		$anchor.mouseout(onAnchorMouseout);
	}
	return $dd;
}

function $createDefDescFromPost_linkReplacement(url, scheme)
{
	if (scheme == "https" || scheme == "http") {
		return "<a href=\"" + url + "\">" + url + "</a>";
	} else if (scheme == "ttps" || scheme == "ttp") {
		return "<a href=\"h" + url + "\">" + url + "</a>";
	} else {
		return url;
	}
}

function $createDefDescFromPost_anchorReplacement(anchor)
{
	return "<a class=\"anchor\" href=\"#\">" + anchor + "</a>";
}

function includesUnsafeTag(html)
{
	var matches = html.match(/<.+?>/g);
	if (matches != null) {
		for (var i = 0; i < matches.length; i++) {
			if (matches[i] != "<br>") {
				return true;
			}
		}
	}
	return false;
}

function onAnchorMouseover()
{
	var $anchor = $(this);
	if ($anchor.attr("popupid").length > 0) {
		return;
	}
	var offset = $anchor.offset();
	var $popup = $createPopup(getAnchorNumbersFromAnchor($anchor.html()), offset.left, offset.top);
	$anchor.attr("popupid", $popup.attr("id"));
}

function onAnchorMouseout()
{
	var $anchor = $(this);
	if ($anchor.attr("popupid").length > 0) {
		var popupId = $anchor.attr("popupid");
		$anchor.attr("popupid", "");
		$("#" + popupId).remove();
	}
}

var popupCount = 0;

function $createPopup(numbers, x, y)
{
	var $dl = $("<dl>");
	for (var i = 0; i < numbers.length; i++) {
		var $dt, $dd;
		var post = posts[numbers[i]];
		if (post != undefined) {
			$dt = $createDefTermFromPost(post);
			$dd = $createDefDescFromPost(post);
		} else {
			$dt = $("<dt>" + numbers[i] + " ���擾�̃��X</dt>");
			$dd = $("<dd><br></dd>");
		}
		$dl.append($dt);
		$dl.append($dd);
	}
	var $popup = $("<div>");
	$popup.attr("id", "popup" + popupCount);
	$popup.addClass("popup");
	$popup.append($dl);
	$(document.body).append($popup);
	$popup.css("top", y - $popup.height() - 9 + "px").css("left", x + "px");
	popupCount++;
	return $popup;
}
