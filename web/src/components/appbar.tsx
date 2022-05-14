import React from 'react';
import {
  AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps,
  Toolbar,
  Typography,
  IconButton,
  styled
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface StyledAppBarProps extends MuiAppBarProps {
  open: boolean | undefined;
}

interface AppBarProps extends StyledAppBarProps {
  handleClose: () => void;
}

const drawerWidth: number = 240;

const AppBarStyled = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<StyledAppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const AppBar = ({open, handleClose}: AppBarProps) => {
  return (
    <AppBarStyled position="absolute" open={open}>
      <Toolbar
        sx={{
          pr: '24px'
        }}
        >
          <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleClose}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Dashboard
            </Typography>
        </Toolbar>
    </AppBarStyled>
  )
}

export default AppBar;