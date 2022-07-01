# SandBoxBoard

誰でも自由に編集や削除ができるSlack風?匿名掲示板です。

## 使い方

* 環境変数`DATABASE_URL`か.envファイルにPostgreSQLのサーバー(postgres://user:password@domain/name)を設定して
```
npm install
npx prisma db push
npm run build
npm start
```
* 環境変数PORTに設定されているポートか、未設定なら3000でアクセスできる

## 機能

* tensorflow.jsのtoxicity checkに引っかかった場合メッセージは送信できない
* data/gacha/キーワード.txt というファイルを置くとそのキーワードを送信したときにBotがその中からランダムで1行返す
