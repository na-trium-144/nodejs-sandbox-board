import { useState, useEffect } from 'react'
// import logo from './logo.svg'
// import './App.css'
import * as action from './action.js'
import EditForm from './EditForm.jsx'
import Navigation from './Navigation.jsx'
import Comments from './Comments.jsx'


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
      <Comments
        onGetPrev={() => {
          action.getPrevComments(setComments, setLastFetchTime, comments[0].id);
        }}
        onGetPrevAll={() => {
            action.getPrevComments(setComments, setLastFetchTime, comments[0].id, true);
        }}
        items={comments}
        onEdit={(c) => {
          setEditId(c.id);
          setFooterStatus("");
          setSendName(c.name);
          setSendContent(c.content);
        }}
      />
      <a name="latest"></a>
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
