import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import {IconButton} from "@mui/material";

export default function TitleBar() {

    const handleLogout = () => {
        window.location.href = 'https://example.com';
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Surname Family Directory
                    </Typography>
                    <IconButton
                        size="large"
                        aria-label="Logout"
                        color="inherit"
                        onClick={handleLogout}
                    >
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
        </Box>
    );
}