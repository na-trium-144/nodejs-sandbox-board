import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';

function Comment(props){
  const c = props.item;
  return(
    <Box
      sx={{
        width:'100%',
        '&:hover': {
          backgroundColor: '#ffd',
        },
      }}
    >
      <a name={c.id} />
      <List>
        <ListItem
          key={c.id + "_1"}
          secondaryAction={
            <IconButton size="small" onClick={props.onEdit} color="primary">
              <EditIcon />
            </IconButton>
          }
        >
          <Typography
            variant="body2"
            component="div"
            sx={{color:'text.primary', fontWeight:'bold', wordBreak:'break-word'}}
          >
            {c.name || "名無し"}
          </Typography>
          <Typography
            variant="body2"
            component="div"
            sx={{color:'text.secondary', marginLeft:1}}
          >
            {"("}
            {c.edited && "編集済み: "}
            {c.timestr}
            {")"}
          </Typography>
        </ListItem>
        <ListItem
          key={c.id + "_2"}
        >
          <Typography
            variant="body1"
            component="div"
            sx={{wordBreak:'break-word'}}
          >
            {c.content}
          </Typography>
        </ListItem>
      </List>
    </Box>
  )
}
export default function Comments(props){
  return(
    <List>
      <ListItem>
        <ButtonGroup variant="text" size="small">
          <Button onClick={props.onGetPrev}>前の20件を表示</Button>
          <Button onClick={props.onGetPrevAll}>すべてのコメントを表示</Button>
          <Button><Link href="#latest" underline="none">一番下へ行く</Link></Button>
        </ButtonGroup>
      </ListItem>
      {props.items.map((c) => (
        <ListItem key={c.id}>
          <Comment
            item={c}
            onEdit={() => {props.onEdit(c);}}
          />
        </ListItem>
      ))}
    </List>
  )
}
