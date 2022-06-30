import { useState } from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-header1">SandBoxBoard</h1>
        <div className="App-header2">誰でも自由に編集や削除ができる匿名掲示板です。</div>
      </header>
      <main className="App-Main">
        <div className="comments_begin">
          <button id="load_before">前の20件を表示</button>
          <button id="load_before_all">すべてのコメントを表示</button>
          <a href="#latest">一番下へ行く</a>
        </div>
        <div id="comments" className="comments">
        </div>
        <div className="comments_last">
          <a name="latest"></a>
        </div>
      </main>
      <footer className="App-footer">
        <div className="footer1" id="send_status">新しいコメントを送信</div>
        <div>
          <input placeholder="名前" name="name" id="send_name" /*<% if(name !== undefined){ %> value="<%= name %>" <% } %>*/ />
          <input placeholder="コメント" name="content" id="content" />
          <button id="send_button">送信</button>
        </div>
      </footer>
    </div>
  )
}

export default App
