export async function send(id, name, content){
  const response = await fetch("/send", {
    method: "post",
    body: new URLSearchParams({
      name: name,
      content: content,
      id: id
    })
  });
  const status = await response.text();
  return status;
}
export async function del(id){
  if(window.confirm("コメントを削除しますか?")){
    const response = await fetch("/delete", {
      method: "post",
      body: new URLSearchParams({
        id: editId
      })
    });
    const status = await response.text();
    return status;
  }
}
