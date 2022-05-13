const express = require("express");
const fs = require("fs");
const ejs = require("ejs");
const { format, addHours } = require("date-fns");

const app = express();
// app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

// const comments = client.comment.findMany();

function redirectMain(response, anchor, name, focus){
    if(focus){
        response.status(303).set("Location", "/?focus=1&name=" + encodeURIComponent(name) + "#" + anchor).end();
    }else{
        response.status(303).set("Location", "/#" + anchor).end();
    }
}

app.post("/delete", async (request, response) => {
    try{
        await client.comment.delete({
            where:{
                id:parseInt(request.body.id, 10)
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

app.post("/send", async (request, response) => {
    message = {
        name: request.body.name,
        content:request.body.content,
        edited:false,
        time:new Date()
        // id:parseInt(request.body.id, 10)
    };
    // if(request.body.id === undefined){
        // if(comments.length === 0){
        //     message.id = 0
        // }else{
        //     message.id = comments[comments.length - 1].id + 1;
        // }
        // comments.push(message);
    await client.comment.create({data:message});
    if(message.content === "ポケモンガチャ"){
        message = {
            name: "Bot",
            content: pokemonGachaContent[Math.floor(Math.random() * pokemonGachaContent.length)],
            edited:false,
            time:new Date()
            // id:parseInt(request.body.id, 10)
        };
        await client.comment.create({data:message});

    }
    //fs.writeFileSync(commentsFile, JSON.stringify(comments), "utf-8");
    //response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), {
    //    text: "コメントを送信しました。"
    //}));
    redirectMain(response, "latest", request.body.name, true);
    // }
});
app.post("/send_edit", async (request, response) => {
    // else{
    try{
        await client.comment.update({
            data:{
                name:request.body.name,
                content:request.body.content,
                edited:true,
                time:new Date()
            },
            where:{
                id:parseInt(request.body.id, 10)
            }
        });
            // message.edited = true;
            // const editTargetIndex = comments.findIndex((m) => (m.id === parseInt(request.body.id, 10)));
            // if(editTargetIndex === -1){
            //     response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), { text:"コメントが存在しません。" }));
            // }else{
            //     comments[editTargetIndex] = message;
            // }
        //response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), {
        //    text: "コメントを編集しました。"
        //}));
        redirectMain(response, parseInt(request.body.id, 10), "", false);
        // }
        // fs.writeFileSync("comments.json", JSON.stringify(comments), "utf-8");
    }catch{
        response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), { text:"コメントの編集時にエラーが発生しました。" }));
    }
});

function getCommentsHTML(comments, start, end){
    const template = fs.readFileSync("comments.ejs", "utf-8");
    const html = ejs.render(template, {
        books: comments.slice(start, end).map((m) => ({
            name: m.name,
            content: m.content,
            edited: m.edited,
            id: m.id,
            time: format(addHours(new Date(m.time), 9), "y/M/d(eee) H:mm:ss")
        }))
    });
    return html;
}

app.get("/", async (request, response) => {
  const comments = await client.comment.findMany({
      orderBy:{
          id:"asc"
      }
  });
    let start = comments.length - 20;
    let end = comments.length;
    let startid = 0;
    let endid = 0;
    if(start < 0){
        start = 0;
    }
    if(start < comments.length){
        startid = comments[start].id;
    }
    if(end - 1 >= 0){
        endid = comments[end - 1].id;
    }
    const template = fs.readFileSync("template.ejs", "utf-8");
    const html = ejs.render(template, {
        name: request.query.name,
        focus: request.query.focus,
        comments: getCommentsHTML(comments, start, end),
        startid: startid,
        endid: endid
    });
    response.send(html);
});
app.get("/comments", async (request, response) => {
    const comments = await client.comment.findMany({
        orderBy:{
            id:"asc"
        }
    });
    let end = 0;
    let endid = 0;
    let start = 0;
    let startid = 0;
    let count = 20;
    if(request.query.count !== undefined){
        count = parseInt(request.query.count, 10);
        if(count < 0){
            count = comments.length;
        }
    }
    if(request.query.lastid !== undefined){
        end = comments.findIndex((m) => (m.id === parseInt(request.query.lastid, 10)));
        if(end === -1){
            end = 0;
        }
        start = end - count;
        if(start < 0){
            start = 0;
        }
        if(start < comments.length){
            startid = comments[start].id;
        }
    }else if(request.query.startid !== undefined){
        start = 1 + comments.findIndex((m) => (m.id === parseInt(request.query.startid, 10)));
        if(start === 1 + -1){
            start = comments.length;
        }
        end = start + count;
        if(end > comments.length){
            end = comments.length;
        }
        if(end - 1 >= 0){
            endid = comments[end - 1].id;
        }
    }
    const html = getCommentsHTML(comments, start, end);
    response.json({startid: startid, endid: endid, html: html});
});
app.get("/edit", async (request, response) => {
    try{
        const comment = await client.comment.findUnique({
            where:{
                id:parseInt(request.query.id, 10)
            }
        });
        // const editTargetIndex = comments.findIndex((m) => (m.id === parseInt(request.query.id, 10)));
        // if(editTargetIndex === -1){
        //     response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), { text:"コメントが存在しません。" }));
        // }else{
        const template = fs.readFileSync("edit.ejs", "utf-8");
        const html = ejs.render(template, { book:comment });
        response.send(html);
        // }
    }catch{
        response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), { text:"コメントの編集時にエラーが発生しました。" }));
    }
});
app.listen(process.env.PORT || 3000);
