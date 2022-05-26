const express = require("express");
const fs = require("fs");
const ejs = require("ejs");
const {
	format,
	addHours
} = require("date-fns");

const app = express();
// app.use(express.static("static"));
app.use(express.urlencoded({
	extended: true
}));

const {
	PrismaClient
} = require("@prisma/client");
const client = new PrismaClient();

const tf = require('@tensorflow/tfjs');
const toxicity = require('@tensorflow-models/toxicity');
var txModel = undefined;
toxicity.load(0.9).then((model) => {txModel = model;});

// const comments = client.comment.findMany();

function redirectMain(response, anchor, name, focus) {
	if (focus) {
		response.status(303).set("Location", "/?focus=1&name=" + encodeURIComponent(name) + "#" + anchor).end();
	} else {
		response.status(303).set("Location", "/#" + anchor).end();
	}
}

app.post("/delete", async (request, response) => {
	try {
		await client.comment.delete({
			where: {
				id: parseInt(request.body.id, 10)
			}
		});
		// comments = comments.filter((m) => (m.id !== parseInt(request.body.id, 10)));
		// fs.writeFileSync("comments.json", JSON.stringify(comments), "utf-8");
		//response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), {
		//    text: "コメントを削除しました。"
		//}));
		redirectMain(response, "latest", "", false);
	} catch (error) {
		response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), {
			text: "コメントの削除時にエラーが発生しました。"
		}));
	}
});

const pokemonGachaContent = fs.readFileSync("pokemon.txt", "utf-8").split("\n")

async function txCheck(content){
    var txResult = [];
	try{
		const txPrediction = await txModel.classify(content);
		console.log(txPrediction.map((p) => ({label:p.label, match:p.results[0].match})));
        for(const p of txPrediction){
            if(p.results[0].match === true){
                txResult.push(p.label);
            }
        }
        if(txResult.length > 0){
            //content += " [" + txResult.join(", ") + "]"
            content = "[有害度検知: " + txResult.join(",") + "]"
        }
	}catch{
        
	}
    return content;
}

async function commentAdd(name, content){
	let message = {
		name: name,
		content: content,
		edited: false,
		time: new Date()
		// id:parseInt(request.body.id, 10)
	}
	await client.comment.create({data: message});
	// if(comments.length === 0){
	//     message.id = 0
	// }else{
	//     message.id = comments[comments.length - 1].id + 1;
	// }
	// comments.push(message);
	//fs.writeFileSync(commentsFile, JSON.stringify(comments), "utf-8");
	return "";
}
async function commentEdit(id, name, content){
	const message = {
		name: name,
		content: content,
		edited: true,
		time: new Date()
	}
	try{
		await client.comment.update({
			data: message,
			where: {id: id}
		});
		// message.edited = true;
		// const editTargetIndex = comments.findIndex((m) => (m.id === parseInt(request.body.id, 10)));
		// if(editTargetIndex === -1){
		//     response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), { text:"コメントが存在しません。" }));
		// }else{
		//     comments[editTargetIndex] = message;
		// }
		//fs.writeFileSync(commentsFile, JSON.stringify(comments), "utf-8");
		return "";
	}catch{
		return "コメントの編集時にエラーが発生しました。"
	}
}

app.post("/send", async (request, response) => {
	let status = "";
	var content = request.body.content;
    content = await txCheck(content);
	/*const message = {
		name: request.body.name,
		content: content,
		edited: false,
		time: new Date()
	};*/
	if(request.body.id === undefined || request.body.id === "undefined"){
		status = await commentAdd(request.body.name, content);

		if (content === "ポケモンガチャ") {
			status = await commentAdd("Bot", pokemonGachaContent[Math.floor(Math.random() * pokemonGachaContent.length)]);
		}
		//redirectMain(response, "latest", request.body.name, true);
//app.post("/send_edit", async (request, response) => {
	}else{
		//try {
		var content = request.body.content;
		content = await txCheck(content);
		status = await commentEdit(parseInt(request.body.id, 10), request.body.name, content);
		
		//response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), {
		//    text: "コメントを編集しました。"
		//}));
		//redirectMain(response, parseInt(request.body.id, 10), "", false);
		// } catch {
			// response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), {
				// text: "コメントの編集時にエラーが発生しました。"
			// }));
		// }
	}
	response.send(status);
});

function getCommentHTML(comment) {
	const template = fs.readFileSync("comments.ejs", "utf-8");
	const html = ejs.render(template, {
		book: {
			name: comment.name,
			content: comment.content,
			edited: comment.edited,
			id: comment.id,
			time: format(addHours(new Date(comment.time), 9), "y/M/d(eee) H:mm:ss")
		}
	});
	return html;
}

app.get("/", async (request, response) => {
	/*const comments = await client.comment.findMany({
		orderBy: {
			id: "asc"
		}
	});
	let start = comments.length - 20;
	let end = comments.length;
	let startid = 0;
	let endid = 0;
	if (start < 0) {
		start = 0;
	}
	if (start < comments.length) {
		startid = comments[start].id;
	}
	if (end - 1 >= 0) {
		endid = comments[end - 1].id;
	}*/
	const template = fs.readFileSync("template.ejs", "utf-8");
	const html = ejs.render(template, {
		name: request.query.name,
		focus: request.query.focus,
		//comments: getCommentsHTML(comments, start, end),
		//startid: startid,
		//endid: endid
	});
	response.send(html);
});

//startidより前の20件を返す
app.get("/comments", async (request, response) => {
	let comments;
	if(request.query.startid !== undefined && request.query.startid !== "undefined"){
		comments = await client.comment.findMany({
			orderBy: {id: "asc"},
			where: {id: {lt: parseInt(request.query.startid, 10)}}
		});
	}else{
		comments = await client.comment.findMany({
			orderBy: {id: "asc"},
		});
	}
	let count = 20;
	if(request.query.all !== undefined && request.query.all !== "false"){
		count = comments.length;
	}
	response.json({
		time: new Date().toJSON(),
		comments: comments.slice(-count).map((m) => ({
			id: m.id,
			name: m.name,
			content: m.content,
			edited: m.edited,
			timestr: format(addHours(new Date(m.time), 9), "y/M/d(eee) H:mm:ss")
			//html: getCommentHTML(m)
		}))
	});
});
//startid以降でtime以降に変更されたものを返す
app.get("/diff", async (request, response) => {
	let comments;
	if(request.query.startid !== undefined && request.query.startid !== "undefined"){
		comments = await client.comment.findMany({
			orderBy: {id: "asc"},
			where: {
				id: {gte: parseInt(request.query.startid, 10)},
				time: {gte: new Date(request.query.time)}
			}
		});	
	}else{
		comments = await client.comment.findMany({
			orderBy: {id: "asc"},
			where: {time: {gte: new Date(request.query.time)}}
		});	
	}
	response.json({
		time: new Date().toJSON(),
		comments: comments.map((m) => ({
			id: m.id,
			name: m.name,
			content: m.content,
			edited: m.edited,
			timestr: format(addHours(new Date(m.time), 9), "y/M/d(eee) H:mm:ss")
			//html: getCommentHTML(m)
		}))
	});
});

app.get("/edit", async (request, response) => {
	try {
		const comment = await client.comment.findUnique({
			where: {
				id: parseInt(request.query.id, 10)
			}
		});
		// const editTargetIndex = comments.findIndex((m) => (m.id === parseInt(request.query.id, 10)));
		// if(editTargetIndex === -1){
		//     response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), { text:"コメントが存在しません。" }));
		// }else{
		const template = fs.readFileSync("edit.ejs", "utf-8");
		const html = ejs.render(template, {
			book: comment
		});
		response.send(html);
		// }
	} catch {
		response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), {
			text: "コメントの編集時にエラーが発生しました。"
		}));
	}
});

app.get("/template.js", (request, response)=>{
	response.send(fs.readFileSync("template.js", "utf-8"));
});
app.get("/comment.js", (request, response)=>{
	response.send(fs.readFileSync("comment.js", "utf-8"));
});
app.get("/template.css", (request, response)=>{
	response.header("Content-Type", "text/css")
	response.send(fs.readFileSync("template.css", "utf-8"));
});
app.listen(process.env.PORT || 3000);
