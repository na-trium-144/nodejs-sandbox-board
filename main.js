const express = require("express");
const fs = require("fs");
const ejs = require("ejs");
const dateFns = require("date-fns");
// const format = dateFns;

const app = express();
// app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

// const comments = client.comment.findMany();

app.post("/delete", async (request, response) => {
    await client.comment.delete({
        where:{
            id:parseInt(request.body.id, 10)
        }
    });
    // comments = comments.filter((m) => (m.id !== parseInt(request.body.id, 10)));
    // fs.writeFileSync("comments.json", JSON.stringify(comments), "utf-8");
    response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), { text:"コメントを削除しました。" }));
});

app.post("/send", async (request, response) => {
    message = {
        name: request.body.name,
        content:request.body.content,
        edited:false,
        time:new Date(),
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
    response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), { text:"コメントを送信しました。" }));
    // }
});
app.post("/send_edit", async (request, response) => {
    // else{
    await client.comment.update({
        data:{
            name:request.body.name,
            content:request.body.content,
            edited:true
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
    response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), { text:"コメントを編集しました。" }));
        // }
    // }
    // fs.writeFileSync("comments.json", JSON.stringify(comments), "utf-8");
});

app.get("/", async (request, response) => {
  const comments = await client.comment.findMany();
  const template = fs.readFileSync("template.ejs", "utf-8");
  const html = ejs.render(template, { books: comments, format: dateFns.format });
  response.send(html);
});
app.get("/edit", async (request, response) => {
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
});
app.listen(process.env.PORT || 3000);
