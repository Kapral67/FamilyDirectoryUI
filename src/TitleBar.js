import {Auth, API} from 'aws-amplify';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import {useState} from 'react';

export default function TitleBar() {

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadClick = async () => {
        setIsDownloading(true);
        let blob = await API.get('HttpApi', '/pdf', {
            headers: {
                Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
            },
            responseType: 'blob'
        });

        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${process.env.REACT_APP_SURNAME}FamilyDirectory.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloading(false);
    };

    return (
        <AppBar position={'static'}>
            <Toolbar>
                <Typography variant={'h6'} sx={{ flexGrow: 1 }}>
                    {`${process.env.REACT_APP_SURNAME} Family Directory`}
                </Typography>
                { isDownloading ? (
                    <IconButton disabled>
                        <CircularProgress color={'secondary'} size={'2rem'} />
                    </IconButton>
                ) : (
                    <IconButton
                        size={'large'}
                        aria-label={'Download'}
                        color={'inherit'}
                        onClick={handleDownloadClick}
                    >
                        <DownloadIcon />
                    </IconButton>
                )}
                <IconButton
                    size={'large'}
                    aria-label={'Logout'}
                    color={'inherit'}
                    onClick={() => Auth.signOut({ global: true })}
                >
                    <LogoutIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}