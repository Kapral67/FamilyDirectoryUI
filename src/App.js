import TitleBar from "./TitleBar";
import Content from "./Content";
import {Auth} from "aws-amplify";
import {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import {CircularProgress} from "@mui/material";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {ConfirmProvider} from "material-ui-confirm";

export default function App() {

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Auth.currentAuthenticatedUser().then(() => {
            setIsLoading(false);
        }).catch(() => {
            void Auth.federatedSignIn();
        });
    }, []);

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TitleBar />
            <ConfirmProvider>
                <Content />
            </ConfirmProvider>
        </LocalizationProvider>
    );
}