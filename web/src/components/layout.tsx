import React, { useState } from "react";
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, Container } from "@mui/material";
import AppBar from "./appbar";
import NavBar from "./navbar";

interface LayoutProps {}

const Layout = () => {
  const [open, setOpen] = useState(true);
  const toggleNav = () => setOpen(!open);
  return (
    <>
      <AppBar open={open} handleClose={toggleNav} />
      <NavBar open={open} toggleDrawer={toggleNav} />
      <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </>
  );
};

export default Layout;