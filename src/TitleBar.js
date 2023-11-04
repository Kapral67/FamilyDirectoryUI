import {useAuth0} from "@auth0/auth0-react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {IconButton} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function TitleBar() {
    const {logout} = useAuth0();
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {process.env.REACT_APP_SURNAME} Family Directory
                </Typography>
                <IconButton
                    size="large"
                    aria-label="Logout"
                    color="inherit"
                    onClick={() => logout({
                        logoutParams: {
                            returnTo: process.env.REACT_APP_REDIRECT_URI
                        }
                    })}
                >
                    <LogoutIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}