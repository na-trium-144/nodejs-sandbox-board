import { useState, useEffect } from 'react'
// import logo from './logo.svg'
import './App.css'
import * as action from './action.js'
import EditForm from './EditForm.jsx'
import Navigation from './Navigation.jsx'

function Comment(props){
  const c = props.comment;
  const onEdit = props.onEdit;
  return(
    <div class="comment_item" id={c.id}>
      <a name={c.id}>
        <div class="comment_item_header">
          <table width="100%">
          <tr>
          <td>
            <b class="comment_item_author">
              {c.name}
            </b>
            <i class="comment_item_date">(
              {c.edited && <span>編集済み: </span>}
              <span>{c.timestr}</span>
              )
            </i>
          </td>
          <td align="right">
            <button onClick={onEdit}>
              編集
            </button>
          </td>
          </tr>
          </table>
        </div>
        <div class="comment_item_body">
          {c.content}
        </div>
      </a>
    </div>
  )
}
function App() {
  const [comments, setComments] = useState([])
  const [editId, setEditId] = useState(-1)
  const [footerStatus, setFooterStatus] = useState("")
  const [sendName, setSendName] = useState("")
  const [sendContent, setSendContent] = useState("")
  const [lastFetchTime, setLastFetchTime] = useState(new Date().toJSON());

  useEffect(() => {
    action.getPrevComments(setComments, setLastFetchTime);
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      action.getCommentsDiff(setComments, setLastFetchTime, comments[0].id, lastFetchTime);
    }, 1000);
    return () => {clearInterval(interval);};
  }, [comments, lastFetchTime])

  return (
    <div className="App">
      <Navigation />
      <main className="App-main">
        <div className="comments_begin">
          <button
            onClick={() => {
              action.getPrevComments(setComments, setLastFetchTime, comments[0].id);
            }}
          >
            前の20件を表示
          </button>
          <button
            onClick={() => {
              action.getPrevComments(setComments, setLastFetchTime, comments[0].id, true);
            }}
          >
            すべてのコメントを表示
          </button>
          <a href="#latest">一番下へ行く</a>
        </div>
        <div className="comments">
          {comments.map((c) => (
            <Comment
              comment={c}
              onEdit={() => {
                setEditId(c.id);
                setFooterStatus("");
                setSendName(c.name);
                setSendContent(c.content);
              }}
            />
          ))}
        </div>
        <div className="comments_last">
          <a name="latest"></a>
        </div>
      </main>
      <EditForm
        status={footerStatus}
        editId={editId}
        onCancel={() => {
          setEditId(-1);
          setSendName("");
          setSendContent("");
        }}
        onDelete={async () => {
          await action.del(editId, setFooterStatus, setLastFetchTime, () => {
            setEditId(-1);
            setSendName("");
            setSendContent("");
          });
        }}
        name={sendName}
        setName={setSendName}
        content={sendContent}
        setContent={setSendContent}
        onSend={async () => {
          await action.send(editId, sendName, sendContent, setFooterStatus, setLastFetchTime, () => {
            setEditId(-1);
            setSendContent("");
          });
        }}
      />
    </div>
  )
}

export default App
