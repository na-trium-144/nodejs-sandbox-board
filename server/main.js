const express = require("express");
const fs = require("fs");
const ejs = require("ejs");
const {
  format,
  addMinutes
} = require("date-fns");

const app = express();
app.use(express.static("dist"));
app.use(express.urlencoded({
  extended: true
}));

const {
  PrismaClient
} = require("@prisma/client");
const client = new PrismaClient();

// const tf = require('@tensorflow/tfjs');
// const toxicity = require('@tensorflow-models/toxicity');
// var txModel = undefined;
// toxicity.load(0.9).then((model) => {
//   txModel = model;
// });

async function commentDelete(id) {
  try {
    const message = {
      deleted: true,
      time: new Date()
    }
    await client.comment.update({
      data: message,
      where: {
        id: id
      }
    });
    return ["", message.time];
  } catch {
    return ["コメントの削除時にエラーが発生しました。", undefined]
  }
}
app.post("/delete", async (request, response) => {
  let status;
  let time = undefined;
  if (request.body.id === undefined || request.body.id === "undefined") {
    status = "Error: id not set"
  } else {
    [status, time] = await commentDelete(parseInt(request.body.id, 10));
  }
  response.json({status: status, time:time});
});
async function txCheck(content) {
  // var txResult = [];
  // try {
  //   const txPrediction = await txModel.classify(content);
  //   console.log(txPrediction.map((p) => ({
  //     label: p.label,
  //     match: p.results[0].match
  //   })));
  //   for (const p of txPrediction) {
  //     if (p.results[0].match === true) {
  //       txResult.push(p.label);
  //     }
  //   }
  //   if (txResult.length > 0) {
  //     content = "[有害度検知: " + txResult.join(",") + "]"
  //   }
  // } catch {
  //
  // }
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
  return ["", message.time];
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
    return ["", message.time];
  } catch {
    return ["コメントの編集時にエラーが発生しました。", undefined]
  }
}


app.post("/send", async (request, response) => {
  let status = "";
  let time = undefined;
  var content = request.body.content;
  content = await txCheck(content);
  if (request.body.id === undefined || request.body.id === "undefined" || parseInt(request.body.id, 10) < 0) {
    [status, time] = await commentAdd(request.body.name, content);

    try {
      const gachaContent = fs.readFileSync(`${__dirname}/../data/gacha/${content}.txt`, "utf-8").split("\n");
      let gachaMessage = gachaContent[Math.floor(Math.random() * gachaContent.length)];
      await commentAdd("Bot", gachaMessage);
    } catch {

    }
  } else {
    [status, time] = await commentEdit(parseInt(request.body.id, 10), request.body.name, content);
  }
  response.json({status:status, time:time});

});

//startidより前の20件を返す
app.get("/comments", async (request, response) => {
  const fetchTime = new Date();
  let comments;
  if (request.query.startid !== undefined && request.query.startid !== "undefined") {
    comments = await client.comment.findMany({
      orderBy: {
        id: "asc"
      },
      where: {
        id: {
          lt: parseInt(request.query.startid, 10)
        },
        deleted: false
      }
    });
  } else {
    comments = await client.comment.findMany({
      orderBy: {
        id: "asc"
      },
      where: {
        deleted: false
      }
    });
  }
  let count = 20;
  if (request.query.all !== undefined && request.query.all !== "false") {
    count = comments.length;
  }
  response.json({
    time: fetchTime.toJSON(),
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
  const fetchTime = new Date();
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
    time: fetchTime.toJSON(),
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

app.listen(process.env.PORT || 3000);
