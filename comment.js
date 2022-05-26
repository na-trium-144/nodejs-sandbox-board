function replaceTag(str){
	return str.split("<").join("&lt;").split(">").join("&gt;");
}
function commentToHTML(comment){
	return '\
<div class="comment_item" id=<%= id %>>\
	<a name=<%= id %>>\
		<div class="comment_item_header">\
			<table width="100%">\
			<tr>\
			<td>\
				<b class="comment_item_author">\
					<%= name %>\
				</b>\
				<i class="comment_item_date">(\
					<%= edited %>\
					<%= time %>\
					)\
				</i>\
			</td>\
			<td align="right">\
				<button onclick="edit(<%= id %>)">編集</button>\
			</td>\
			</tr>\
			</table>\
		</div>\
		<div class="comment_item_body">\
			<%= content %>\
		</div>\
	</a>\
</div>\
	'.split("<%= id %>").join(comment.id.toString())
	.split("<%= name %>").join(comment.name === "" ? "名無し" : replaceTag(comment.name))
	.split("<%= edited %>").join(comment.edited ? "編集済み:" : "")
	.split("<%= time %>").join(comment.timestr)
	.split("<%= content %>").join(replaceTag(comment.content))
}