let startId = undefined;
let lastId = undefined;
let lastFetchTime = new Date();
let comments = [];

async function getPrevComments(all){
  const response = await fetch("/comments?" + new URLSearchParams({startid: startId, all: all}));
  const resData = JSON.parse(await response.text());
  const place = document.getElementById("comments");
  if(resData.comments.length > 0){
    for(let comment of resData.comments.slice().reverse()){
      comments.unshift(comment);
      place.innerHTML = commentToHTML(comment) + place.innerHTML;
      //place.innerHTML = comment.html + place.innerHTML;
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
  const response = await fetch("/diff?" + new URLSearchParams({startid: startId, time: lastFetchTime}));
  const resData = JSON.parse(await response.text());
  if(resData.comments.length > 0){
    for(let comment of resData.comments){
      if(comment.id > lastId){
        const place = document.getElementById("comments");
        comments.push(comment)
        place.innerHTML += commentToHTML(comment);
        //place.innerHTML += comment.html;
        lastId = comment.id;
      }else{
        const place = document.getElementById(comment.id.toString());
        comments.map((m) => {
          if(m.id === comment.id){
            return comment;
          }else{
            return m;
          }
        });
        place.outerHTML = commentToHTML(comment);
        //place.outerHTML = comment.html;
      }
    }
    //startId = resData.comments[0].id;
  }
  lastFetchTime = resData.time;
}, 1000);

function setSendStatus(s){
  const divStatus = document.getElementById("send_status");
  if(s === ""){
    s = "コメントを送信";
  }
  divStatus.innerHTML = s;
}

let editId = undefined;
