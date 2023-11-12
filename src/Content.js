import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    Grid,
    IconButton,
    Snackbar,
    TextField,
    Tooltip
} from '@mui/material';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Box from '@mui/material/Box';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {Auth, API} from "aws-amplify";
import Loading from "./Loading";

async function getMember (id) {
    let init = {
        headers: {
            Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
        },
        ...id && {
            queryStringParameters: {
                id: `${id}`
            }
        }
    }
    return await API.get('HttpApi', '/get', init);
}

function displayBirthday(data) {
    return (
        <Grid item xs={12} sm={4} md={4}>
            <Typography variant="body2">
                <b>Birthday:</b>
            </Typography>
            <Typography variant="body2">
                {new Date(data['member']['birthday']).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
            </Typography>
        </Grid>
    );
}

function displayDeathday (data) {
    return 'deathday' in data['member'] ? (
        <Grid item xs={12} sm={4} md={4}>
            <Typography variant="body2">
                <b>Deathday:</b>
            </Typography>
            <Typography variant="body2">
                {new Date(data['member']['deathday']).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
            </Typography>
        </Grid>
    ) : (
        <>
        </>
    );
}

function displayEmail (data) {
    return 'email' in data['member'] ? (
        <Grid item xs={12} sm={4} md={4}>
            <Typography variant="body2">
                <b>Email:</b>
            </Typography>
            <Typography variant="body2">
                {data['member']['email']}
            </Typography>
        </Grid>
    ) : (
        <>
        </>
    );
}

function displayPhones (data) {
    if ('phones' in data['member'] && ('MOBILE' in data['member']['phones'] || 'LANDLINE' in data['member']['phones'])) {
        if ('LANDLINE' in data['member']['phones'] && 'MOBILE' in data['member']['phones']) {
            return (
                <>
                    <Grid item xs={12} sm={4} md={4}>
                        <Typography variant="body2">
                            <b>Mobile Phone:</b>
                        </Typography>
                        <Typography variant="body2">
                            {data['member']['phones']['MOBILE']}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} md={4}>
                        <Typography variant="body2">
                            <b>Landline Phone:</b>
                        </Typography>
                        <Typography variant="body2">
                            {data['member']['phones']['LANDLINE']}
                        </Typography>
                    </Grid>
                </>
            );
        }else if ('MOBILE' in data['member']['phones']) {
            return (
                <Grid item xs={12} sm={4} md={4}>
                    <Typography variant="body2">
                        <b>Mobile Phone:</b>
                    </Typography>
                    <Typography variant="body2">
                        {data['member']['phones']['MOBILE']}
                    </Typography>
                </Grid>
            );
        } else {
            return (
                <Grid item xs={12} sm={4} md={4}>
                    <Typography variant="body2">
                        <b>Landline Phone:</b>
                    </Typography>
                    <Typography variant="body2">
                        {data['member']['phones']['LANDLINE']}
                    </Typography>
                </Grid>
            );
        }
    } else {
        return (<></>);
    }
}

function displayAddress (data) {
    if ('address' in data['member']) {
        return (
            <Grid item xs={12} sm={4} md={4}>
                <Typography variant="body2">
                    <b>Address:</b>
                </Typography>
                <Typography variant="body2" style={{whiteSpace: 'pre-line'}}>
                    {data['member']['address'].join('\n')}
                </Typography>
            </Grid>
        );
    } else {
        return (<></>);
    }
}

export default function Content() {
    const [isLoading, setIsLoading] = useState(true);
    const [id, setId] = useState(null);
    const [data, setData] = useState(null);
    const [caller, setCaller] = useState(null);

    useEffect(() => {
        async function getData(id) {
            const data = await getMember(id);
            if (id === null) {
                setCaller(data);
            }
            setData(data);
        }
        setIsLoading(true);
        getData(id).then(() => setIsLoading(false));
    }, [id]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
            <IconButton
                size="large"
                aria-label="Download"
                color="inherit"
                onClick={() => setId(data['family']['ancestor'])}
            >
                <ArrowUpwardIcon />
            </IconButton>
            <Card sx={{ width: '75%', margin: 'auto', display: 'block' }}>
                <CardContent>
                    <CardHeader
                        title={['firstName', 'middleName', 'lastName', 'suffix'].map(key => data['member'][key]).filter(Boolean).join(' ')}
                    />
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        {displayBirthday(data)}
                        {displayDeathday(data)}
                        {displayEmail(data)}
                        {displayPhones(data)}
                        {displayAddress(data)}
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
}