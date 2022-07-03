import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';

export default function EditForm(props){
  return(
    <>
    <Toolbar />
    <AppBar position="fixed" color="inherit" sx={{top: 'auto', bottom: 0, }}>
    <Stack spacing={1}>
      <Box />
      <Box>
      <Grid container spacing={2} alignItems="center">
      <Grid item />
      {
        props.status || (
          props.editId == -1 ?
            <>
              <Grid item sx>
              <Typography variant="caption" gutterBottom>
                新しいコメントを送信
              </Typography>
              </Grid>
            </>
          :
            <>
              <Grid item>
                <Typography variant="caption" gutterBottom>
                コメントを編集
                </Typography>
              </Grid>
              <Grid item>
                <ButtonGroup variant="outlined" size="small">
                  <Button onClick={props.onCancel}>キャンセル</Button>
                  <Button onClick={props.onDelete} startIcon={<DeleteIcon />}>コメントを削除</Button>
                </ButtonGroup>
              </Grid>
            </>
        )
      }
      <Grid item />
      </Grid>
      </Box>
      <Box>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item />
        <Grid item xs={12} sm={3} md={2} lg={2} xl={1}>
          <TextField
            label="名前"
            variant="standard"
            value={props.name}
            onChange={(e) => {props.setName(e.target.value);}}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm md lg xl>
          <TextField
            label="コメント"
            variant="standard"
            multiline
            maxRows={4}
            value={props.content}
            onChange={(e) => {props.setContent(e.target.value);}}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm="auto" md="auto" lg="auto" xl="auto">
          <Button
            variant="contained"
            onClick={props.onSend}
            startIcon={<SendIcon />}
          >
            送信
          </Button>
        </Grid>
        <Grid item />
      </Grid>
      </Box>
      <Box />
    </Stack>
    </AppBar>
    </>
  )
}
