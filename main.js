const express = require("express");
const fs = require("fs");
const ejs = require("ejs");
const dateFns = require("date-fns");
// const format = dateFns;

const app = express();
// app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

let comments = JSON.parse(fs.readFileSync("comments.json", "utf-8"));

app.post("/delete", (request, response) => {
    comments = comments.filter((m) => (m.id !== parseInt(request.body.id, 10)));
    fs.writeFileSync("comments.json", JSON.stringify(comments), "utf-8");
    response.send(
        `<h1>掲示板</h1><p>コメントを削除しました。</p><a href=/>掲示板に戻る</a>`
    );
});

app.post("/send", (request, response) => {
    message = {
        name: request.body.name,
        age:request.body.age,
        edited:false,
        time:new Date().getTime(),
        id:parseInt(request.body.id, 10)
    };
    if(request.body.id === undefined){
        if(comments.length === 0){
            message.id = 0
        }else{
            message.id = comments[comments.length - 1].id + 1;
        }
        // if(message.name === ""){
            //     message.name = "名無し";
            // }
        comments.push(message);
        response.send(
            `<h1>掲示板</h1><p>送信しました。</p><a href=/>掲示板に戻る</a>`
        );
    }else{
        message.edited = true;
        const editTargetIndex = comments.findIndex((m) => (m.id === parseInt(request.body.id, 10)));
        if(editTargetIndex === -1){
            response.send("<h1>掲示板</h1><p>コメントが存在しません</p><a href=/>掲示板に戻る</a>");
        }else{
            comments[editTargetIndex] = message;
            response.send(
                `<h1>掲示板</h1><p>編集しました。</p><a href=/>掲示板に戻る</a>`
            );
        }
    }
    fs.writeFileSync("comments.json", JSON.stringify(comments), "utf-8");
});

app.get("/", (request, response) => {
  const template = fs.readFileSync("template.ejs", "utf-8");
  const html = ejs.render(template, { books: comments, format: dateFns.format });
  response.send(html);
});
app.get("/edit", (request, response) => {
    const editTargetIndex = comments.findIndex((m) => (m.id === parseInt(request.query.id, 10)));
    if(editTargetIndex === -1){
        response.send("<h1>掲示板</h1><p>コメントが存在しません</p><a href=/>掲示板に戻る</a>");
    }else{
        const template = fs.readFileSync("edit.ejs", "utf-8");
        const html = ejs.render(template, { book:comments[editTargetIndex] });
        response.send(html);
    }
});
app.listen(3000);
