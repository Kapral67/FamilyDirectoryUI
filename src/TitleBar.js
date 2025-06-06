
import { get } from 'aws-amplify/api';
import { signOut } from 'aws-amplify/auth';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';

export default function TitleBar() {

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadClick = async () => {
        setIsDownloading(true);
        try {
            const getPdf = get({
                apiName: 'HttpApi',
                path: '/pdf'
            });
            const response = await getPdf.response;
            const blob = await response.body.blob();
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${process.env.REACT_APP_SURNAME}` + (response.headers['content-type'] === 'application/zip' ? 'Family.zip' : 'FamilyDirectory.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <AppBar position={'static'}>
            <Toolbar>
                <Link variant={'h6'} sx={{ flexGrow: 1 }} underline={'none'} color={'inherit'} href={'/'}>
                    {`${process.env.REACT_APP_SURNAME} Family Directory`}
                </Link>
                {isDownloading ? (
                    <IconButton disabled>
                        <CircularProgress color={'secondary'} size={'2rem'} />
                    </IconButton>
                ) : (
                    <Tooltip title="Download">
                        <IconButton
                            size={'large'}
                            aria-label={'Download'}
                            color={'inherit'}
                            onClick={handleDownloadClick}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title="Logout">
                    <IconButton
                        size={'large'}
                        aria-label={'Logout'}
                        color={'inherit'}
                        onClick={() => signOut({ global: true })}
                    >
                        <LogoutIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
}
