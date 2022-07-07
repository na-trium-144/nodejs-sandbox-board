import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import Fade from '@mui/material/Fade';
import Fab from '@mui/material/Fab';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { useState, useEffect } from 'react'

export default function EditForm(props){
  const [ctrlKey, setCtrlKey] = useState(false);
  const scrollBottomTrigger = useScrollTrigger();
  useEffect(()=>{
    if(!scrollBottomTrigger && props.editId === -1){
      props.setEditExpand(false);
    }
  }, [scrollBottomTrigger]);

  return(
    <>
    <Toolbar id="latest" />
    <Fade in={!scrollBottomTrigger}>
      <Box
        sx={{ position: 'fixed', bottom: 80, right: 40 }}
      >
        <Fab
          variant="extended"
          size="small"
          color="primary"
          onClick={(event) => {
            const anchor = (
              (event.target).ownerDocument || document
            ).querySelector('#latest');
            if (anchor) {
              anchor.scrollIntoView({
                block: 'center',
              });
            }
          }}
        >
          <KeyboardArrowDownIcon />
          最新のコメント
        </Fab>
      </Box>
    </Fade>
    <ClickAwayListener
      onClickAway={() => {
        if(props.editId === -1){
          props.setEditExpand(false);
        }
      }}
    >
    <AppBar position="fixed" color="inherit" sx={{top: 'auto', bottom: 0, }}>
    <Accordion
      expanded={props.editExpand}
      onChange={(event, newExpanded) => {
        props.setEditExpand(newExpanded);
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography>
          {
            props.status ||
            props.editId == -1 ?
              "新しいコメントを送信"
            :
              "コメントを編集"
          }
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{marginTop: -1}}
      >
        <Grid container spacing={2} alignItems="flex-end">
          { props.editId == -1 ||
            <Grid item xs={12}>
              <ButtonGroup variant="outlined" size="small">
                <Button onClick={props.onCancel}>キャンセル</Button>
                <Button
                  onClick={props.onDelete}
                  startIcon={<DeleteIcon />}
                >
                  コメントを削除
                </Button>
              </ButtonGroup>
            </Grid>
          }
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
              label="コメント(Ctrl+Enterで送信)"
              variant="standard"
              multiline
              maxRows={4}
              value={props.content}
              onChange={(e) => {props.setContent(e.target.value);}}
              onKeyDown={(e) => {
                if(e.keyCode === 17 || e.keyCode == 91 || e.keyCode == 93){
                  setCtrlKey(true);
                }
                if(e.keyCode === 13 && ctrlKey){
                  props.onSend();
                }
              }}
              onKeyUp={(e) => {
                if (e.keyCode === 17 || e.keyCode == 91 || e.keyCode == 93){
                  setCtrlKey(false);
                }
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm="auto" md="auto" lg="auto" xl="auto">
            <LoadingButton
              variant="contained"
              onClick={props.onSend}
              startIcon={<SendIcon />}
              loading={props.sendProgress}
              loadingPosition="start"
            >
              送信
            </LoadingButton>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
    </AppBar>
    </ClickAwayListener>
    </>
  )
}
