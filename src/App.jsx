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
  const [editExpand, setEditExpand] = useState(false);
  const [sendProgress, setSendProgress] = useState(false);
  // const [deleteProgress, setDeleteProgress] = useState(false);

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
          setEditExpand(true);
        }}
      />
      <a name="latest"></a>
      <EditForm
        editExpand={editExpand}
        setEditExpand={setEditExpand}
        status={footerStatus}
        editId={editId}
        onCancel={() => {
          setEditId(-1);
          setSendName("");
          setSendContent("");
          setEditExpand(false);
        }}
        onDelete={async () => {
          // setDeleteProgress(true);
          await action.del(editId, setFooterStatus, setLastFetchTime, () => {
            setEditId(-1);
            setSendName("");
            setSendContent("");
            setEditExpand(false);
          });
          // setDeleteProgress(false);
        }}
        name={sendName}
        setName={setSendName}
        content={sendContent}
        setContent={setSendContent}
        onSend={async () => {
          setSendProgress(true);
          await action.send(editId, sendName, sendContent, setFooterStatus, setLastFetchTime, () => {
            setEditId(-1);
            setSendContent("");
          });
          setSendProgress(false);
        }}
        sendProgress={sendProgress}
      />
    </div>
  )
}

export default App
