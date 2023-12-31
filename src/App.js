
import TitleBar from './TitleBar';
import Content from './Content';
import { getCurrentUser, signInWithRedirect } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ConfirmProvider } from 'material-ui-confirm';

export default function App() {

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCurrentUser().then(() => {
            setIsLoading(false);
        }).catch(() => {
            void signInWithRedirect();
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