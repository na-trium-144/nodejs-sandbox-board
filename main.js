const express = require("express");
const fs = require("fs");
const ejs = require("ejs");
const {
  format,
  addMinutes
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
toxicity.load(0.9).then((model) => {
  txModel = model;
});

function redirectMain(response, anchor, name, focus) {
  if (focus) {
    response.status(303).set("Location", "/?focus=1&name=" + encodeURIComponent(name) + "#" + anchor).end();
  } else {
    response.status(303).set("Location", "/#" + anchor).end();
  }
}

async function commentDelete(id) {
  try {
    const message = {
      name: "",
      content: "",
      deleted: true,
      time: new Date()
    }
    await client.comment.update({
      data: message,
      where: {
        id: id
      }
    });
    return "";
  } catch {
    return "コメントの削除時にエラーが発生しました。"
  }
}
app.post("/delete", async (request, response) => {
  let status;
  if (request.body.id === undefined || request.body.id === "undefined") {
    status = "Error: id not set"
  } else {
    status = await commentDelete(parseInt(request.body.id, 10));
  }
  response.send(status);
});
async function txCheck(content) {
  var txResult = [];
  try {
    const txPrediction = await txModel.classify(content);
    console.log(txPrediction.map((p) => ({
      label: p.label,
      match: p.results[0].match
    })));
    for (const p of txPrediction) {
      if (p.results[0].match === true) {
        txResult.push(p.label);
      }
    }
    if (txResult.length > 0) {
      content = "[有害度検知: " + txResult.join(",") + "]"
    }
  } catch {

  }
  return content;
}

async function commentAdd(name, content) {
  let message = {
    name: name,
    content: content,
    edited: false,
    deleted: false,
    time: new Date()
  }
  await client.comment.create({
    data: message
  });
  return "";
}
async function commentEdit(id, name, content) {
  const message = {
    name: name,
    content: content,
    edited: true,
    time: new Date()
  }
  try {
    await client.comment.update({
      data: message,
      where: {
        id: id
      }
    });
    return "";
  } catch {
    return "コメントの編集時にエラーが発生しました。"
  }
}


app.post("/send", async (request, response) => {
  let status = "";
  var content = request.body.content;
  content = await txCheck(content);
  if (request.body.id === undefined || request.body.id === "undefined") {
    status = await commentAdd(request.body.name, content);

    try {
      const gachaContent = fs.readFileSync("data/gacha/" + message.content + ".txt", "utf-8").split("\n");
      let gachaMessage = gachaContent[Math.floor(Math.random() * gachaContent.length)];
      await commentAdd("Bot", gachaMessage);
    } catch {

    }
  } else {
    var content = request.body.content;
    content = await txCheck(content);
    status = await commentEdit(parseInt(request.body.id, 10), request.body.name, content);
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
      time: format(addMinutes(new Date(comment.time), new Date().getTimezoneOffset() + 9 * 60), "y/M/d(eee) H:mm:ss")
    }
  });
  return html;
}

app.get("/", async (request, response) => {
  const template = fs.readFileSync("template.ejs", "utf-8");
  const html = ejs.render(template, {
    name: request.query.name,
    focus: request.query.focus,
  });
  response.send(html);
});

//startidより前の20件を返す
app.get("/comments", async (request, response) => {
  let comments;
  if (request.query.startid !== undefined && request.query.startid !== "undefined") {
    comments = await client.comment.findMany({
      orderBy: {
        id: "asc"
      },
      where: {
        id: {
          lt: parseInt(request.query.startid, 10)
        }
      }
    });
  } else {
    comments = await client.comment.findMany({
      orderBy: {
        id: "asc"
      },
    });
  }
  let count = 20;
  if (request.query.all !== undefined && request.query.all !== "false") {
    count = comments.length;
  }
  response.json({
    time: new Date().toJSON(),
    comments: comments.slice(-count).map((m) => ({
      id: m.id,
      name: m.name,
      content: m.content,
      edited: m.edited,
      deleted: m.deleted,
      timestr: format(addMinutes(new Date(m.time), new Date().getTimezoneOffset() + 9 * 60), "y/M/d(eee) H:mm:ss")
      //html: getCommentHTML(m)
    }))
  });
});
//startid以降でtime以降に変更されたものを返す
app.get("/diff", async (request, response) => {
  let comments;
  if (request.query.startid !== undefined && request.query.startid !== "undefined") {
    comments = await client.comment.findMany({
      orderBy: {
        id: "asc"
      },
      where: {
        id: {
          gte: parseInt(request.query.startid, 10)
        },
        time: {
          gte: new Date(request.query.time)
        }
      }
    });
  } else {
    comments = await client.comment.findMany({
      orderBy: {
        id: "asc"
      },
      where: {
        time: {
          gte: new Date(request.query.time)
        }
      }
    });
  }
  response.json({
    time: new Date().toJSON(),
    comments: comments.map((m) => ({
      id: m.id,
      name: m.name,
      content: m.content,
      edited: m.edited,
      deleted: m.deleted,
      timestr: format(addMinutes(new Date(m.time), new Date().getTimezoneOffset() + 9 * 60), "y/M/d(eee) H:mm:ss")
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
    const template = fs.readFileSync("edit.ejs", "utf-8");
    const html = ejs.render(template, {
      book: comment
    });
    response.send(html);
  } catch {
    response.send(ejs.render(fs.readFileSync("message.ejs", "utf-8"), {
      text: "コメントの編集時にエラーが発生しました。"
    }));
  }
});

app.get("/template.js", (request, response) => {
  response.send(fs.readFileSync("template.js", "utf-8"));
});
app.get("/comment.js", (request, response) => {
  response.send(fs.readFileSync("comment.js", "utf-8"));
});
app.get("/template.css", (request, response) => {
  response.header("Content-Type", "text/css")
  response.send(fs.readFileSync("template.css", "utf-8"));
});
app.listen(process.env.PORT || 3000);
