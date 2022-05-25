let startId = undefined;
let lastId = undefined;
let lastFetchTime = new Date();
async function getPrevComments(all){
	let q = ""
	if(startId !== undefined){
		q += "startid=" + startId;
	}
	if(all){
		if(q !== ""){
			q += "&"
		}
		q += "all=1"
	}
	const response = await fetch("/comments?" + q);
	const resData = JSON.parse(await response.text());
	const place = document.getElementById("comments");
	if(resData.comments.length > 0){
		for(let comment of resData.comments.slice().reverse()){
			place.innerHTML = comment.html + place.innerHTML;
		}
		startId = resData.comments[0].id;
		lastId = resData.comments[resData.comments.length - 1].id;
	}
	lastFetchTime = resData.time;
}
getPrevComments(false);
document.getElementById("load_before").onclick = () => {getPrevComments(false);};
document.getElementById("load_before_all").onclick = () => {getPrevComments(true);};
setInterval(async () => {
	let q = "time=" + lastFetchTime;
	if(startId !== undefined){
		q += "&startid=" + startId;
	}
	const response = await fetch("/diff?" + q);
	const resData = JSON.parse(await response.text());
	if(resData.comments.length > 0){
		for(let comment of resData.comments){
			if(comment.id > lastId){
				const place = document.getElementById("comments");
				place.innerHTML += comment.html;
			}else{
				const place = document.getElementById(comment.id.toString());
				place.innerHTML = comment.html.substr(comment.html.indexOf(">") + 1, comment.html.lastIndexOf("</div>"));
			}
		}
		startId = resData.comments[0].id;
	}
	lastFetchTime = resData.time;
}, 1000);
