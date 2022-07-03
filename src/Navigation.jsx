import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function ChannelInfo(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ButtonBase
        id="chi-button"
        aria-controls={open ? 'chi-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <Grid container spacing={1} alignItems="flex-end">
        <Grid item />
        <Grid item>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1 }}
          noWrap
        >
          {props.name}
        </Typography>
        </Grid>
        <Grid item>
        <ArrowDropDownIcon />
        </Grid>
        </Grid>
      </ButtonBase>
      <Menu
        id="chi-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'chi-button',
        }}
      >
        <Grid container spacing={2}>
          <Grid item />
          <Grid item>
            <Typography>
              {props.description}
            </Typography>
          </Grid>
          <Grid item />
        </Grid>
      </Menu>
    </>
  );
}


export default function Navigation(props){
  return(
    <>
    <AppBar position="fixed">
      <Toolbar>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <ChannelInfo name="#General" description="誰でも編集できる掲示板です。" />
      </Toolbar>
    </AppBar>
    <Toolbar />
    </>
  )
}
