document.getElementById("load_before").onclick = () => {
	const http = new XMLHttpRequest();
	http.open("get", "/comments?lastid=" + startId);
	http.send();
	http.onreadystatechange = () => {
		if (http.readyState == 4 && http.status == 200) {
			const place = document.getElementById("comments");
			res = JSON.parse(http.responseText);
			place.innerHTML = res.html + place.innerHTML;
			//window.location.hash = startId.toString();
			startId = res.startid;
		}
	};
};
document.getElementById("load_before_all").onclick = () => {
	const http = new XMLHttpRequest();
	http.open("get", "/comments?count=-1&lastid=" + startId);
	http.send();
	http.onreadystatechange = () => {
		if (http.readyState == 4 && http.status == 200) {
			const place = document.getElementById("comments");
			res = JSON.parse(http.responseText);
			place.innerHTML = res.html + place.innerHTML;
			//window.location.hash = startId.toString();
			startId = res.startid;
		}
	};
};
setInterval(() => {
	const http = new XMLHttpRequest();
	http.open("get", "/comments?count=-1&startid=" + endId);
	http.send();
	http.onreadystatechange = () => {
		if (http.readyState == 4 && http.status == 200) {
			const place = document.getElementById("comments");
			res = JSON.parse(http.responseText);
			place.innerHTML = place.innerHTML + res.html;
			//window.location.hash = startId.toString();
			endId = res.endid;
		}
	};
}, 10000);