import {
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    FormControl, FormLabel,
    Grid,
    IconButton, InputLabel, MenuItem, Select,
    Snackbar,
    TextField,
    Tooltip
} from '@mui/material';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import EditOffIcon from '@mui/icons-material/EditOff';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Box from '@mui/material/Box';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {Auth, API} from "aws-amplify";
import {Upcoming} from "@mui/icons-material";
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

let setId, caller, setCaller, setData, setIsEditing;

async function getData(id) {
    const data = await getMember(id);
    if (id === null) {
        setCaller(data);
    }
    setData(data);
}

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

function getDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
    });
}

function displayBirthday(data) {
    return (
        <Grid item>
            <Typography variant="body2">
                <b>Birthday:</b>
            </Typography>
            <Typography variant="body2">
                {getDate(data['birthday'])}
            </Typography>
        </Grid>
    );
}

function displayDeathday (data) {
    return 'deathday' in data ? (
        <Grid item>
            <Typography variant="body2"><b>Deathday:</b></Typography>
            <Typography variant="body2">{getDate(data['deathday'])}</Typography>
        </Grid>
    ) : (<></>);
}

function displayEmail (data) {
    return 'email' in data ? (
        <Grid item>
            <Typography variant="body2"><b>Email:</b></Typography>
            <Typography variant="body2">{data['email']}</Typography>
        </Grid>
    ) : (<></>);
}

function displayPhones (data) {
    if ('phones' in data && ('MOBILE' in data['phones'] || 'LANDLINE' in data['phones'])) {
        if ('LANDLINE' in data['phones'] && 'MOBILE' in data['phones']) {
            return (<>
                        <Grid item>
                            <Typography variant="body2"><b>Mobile Phone:</b></Typography>
                            <Typography variant="body2">{data['phones']['MOBILE']}</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2"><b>Landline Phone:</b></Typography>
                            <Typography variant="body2">{data['phones']['LANDLINE']}</Typography>
                        </Grid>
                    </>);
        }else if ('MOBILE' in data['phones']) {
            return (
                <Grid item>
                    <Typography variant="body2"><b>Mobile Phone:</b></Typography>
                    <Typography variant="body2">{data['phones']['MOBILE']}</Typography>
                </Grid>
            );
        } else {
            return (
                <Grid item>
                    <Typography variant="body2"><b>Landline Phone:</b></Typography>
                    <Typography variant="body2">{data['phones']['LANDLINE']}</Typography>
                </Grid>
            );
        }
    } else {
        return (<></>);
    }
}

function displayAddress (data) {
    return 'address' in data ? (
        <Grid item>
            <Typography variant="body2"><b>Address:</b></Typography>
            <Typography variant="body2" style={{whiteSpace: 'pre-line'}}>{data['address'].join('\n')}</Typography>
        </Grid>
    ) : (<></>);
}

function displayEditCard (data) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Card sx={{ width: '100%', margin: 'auto', display: 'block' }}>
                <CardContent>
                    <Box component={'form'}>
                        <Grid container
                              spacing={2}
                              direction={'column'}
                              justifyContent={'space-evenly'}
                              alignItems={'stretch'}
                        >
                            <Grid item>
                                <TextField
                                    label={'First Name'}
                                    required
                                    fullWidth
                                    defaultValue={data['firstName']}
                                />
                            </Grid>
                            <Grid item>
                                { 'middleName' in data ? (
                                    <TextField
                                        label={'Middle Name'}
                                        fullWidth
                                        defaultValue={data['middleName']}
                                    />
                                ) : (
                                    <TextField
                                        label={'Middle Name'}
                                        fullWidth
                                    />
                                ) }
                            </Grid>
                            <Grid item>
                                <TextField
                                    label={'Last Name'}
                                    required
                                    fullWidth
                                    defaultValue={data['lastName']}
                                />
                            </Grid>
                            <Grid item>
                                {'suffix' in data ? (
                                    <TextField
                                        label={'Suffix'}
                                        select
                                        fullWidth
                                        defaultValue={data['suffix']}
                                    >
                                        <MenuItem value={''}><i>None</i></MenuItem>
                                        <MenuItem value={'Jr'}>Jr</MenuItem>
                                        <MenuItem value={'Sr'}>Sr</MenuItem>
                                    </TextField>
                                ) : (
                                    <TextField
                                        label={'Suffix'}
                                        select
                                        fullWidth
                                    >
                                        <MenuItem value={''}><i>None</i></MenuItem>
                                        <MenuItem value={'Jr'}>Jr</MenuItem>
                                        <MenuItem value={'Sr'}>Sr</MenuItem>
                                    </TextField>
                                )}
                            </Grid>
                            <Grid item>
                                <DatePicker
                                    sx={{ width: '50%' }}
                                    label={'Birthday'}
                                    disableFuture
                                    defaultValue={dayjs(data['birthday'])}
                                />
                                {'deathday' in data ? (
                                    <DatePicker
                                        sx={{ width: '50%' }}
                                        label={'Deathday'}
                                        disableFuture
                                        defaultValue={dayjs(data['deathday'])}
                                    />
                                ) : (
                                    <DatePicker
                                        sx={{ width: '50%' }}
                                        label={'Deathday'}
                                        disableFuture
                                    />
                                )}
                            </Grid>
                            <Grid item>
                                {'email' in data ? (
                                    <TextField
                                        label={'Email'}
                                        fullWidth
                                        defaultValue={data['email']}
                                    />
                                ) : (
                                    <TextField label={'Email'} fullWidth/>
                                )}
                            </Grid>
                            <Grid item>
                                {'address' in data ? (
                                    <TextField
                                        label={'Address Line 1'}
                                        fullWidth
                                        defaultValue={data['address'][0]}
                                    />
                                ) : (
                                    <TextField label={'Address Line 1'} fullWidth/>
                                )}
                            </Grid>
                            <Grid item>
                                {'address' in data ? (
                                    <TextField
                                        label={'Address Line 2'}
                                        fullWidth
                                        defaultValue={data['address'][1]}
                                    />
                                ) : (
                                    <TextField label={'Address Line 2'} fullWidth/>
                                )}
                            </Grid>
                            <Grid item>
                                {'phones' in data && 'MOBILE' in data['phones'] ? (
                                    <TextField
                                        sx={{ width: '50%' }}
                                        label={'Mobile Phone'}
                                        defaultValue={data['phones']['MOBILE']}
                                    />
                                ) : (
                                    <TextField
                                        sx={{ width: '50%' }}
                                        label={'Mobile Phone'}
                                    />
                                )}
                                {'phones' in data && 'LANDLINE' in data['phones'] ? (
                                    <TextField
                                        sx={{ width: '50%' }}
                                        label={'Landline Phone'}
                                        defaultValue={data['phones']['LANDLINE']}
                                    />
                                ) : (
                                    <TextField
                                        sx={{ width: '50%' }}
                                        label={'Landline Phone'}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={12} style={{ alignSelf: 'stretch' }}><br/></Grid>
                        <Grid item>
                            <IconButton onClick={() => setIsEditing(false)}>
                                <EditOffIcon />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <IconButton>
                                <SaveAsIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </LocalizationProvider>
    );
}

function displayCard (data, isDescendant = false) {
    let isEditable = false;
    if (!isDescendant) {
        isEditable = data['id'] === caller['member']['id'];
        if (!isEditable && 'spouse' in caller) {
            isEditable = data['id'] === caller['spouse']['id'];
        }
        if (!isEditable && 'descendants' in caller) {
            isEditable = caller['descendants'].some(descendant => {
                if (descendant['id'] === data['id']) {
                    const dateParts = descendant['birthday'].split('-').map(Number);
                    const date = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
                    const now = new Date();
                    return date.getTime() <= new Date(Date.UTC(now.getUTCFullYear() - +process.env.REACT_APP_AGE_OF_MAJORITY, now.getUTCMonth(), now.getUTCDate())).getTime();
                } else {
                    return false;
                }
            });
        }
    }
    return (
        <Card sx={{ width: '75%', margin: 'auto', display: 'block' }}>
            <CardContent>
                <CardHeader
                    title={['firstName', 'middleName', 'lastName', 'suffix'].map(key => data[key]).filter(Boolean).join(' ')}
                    action={isDescendant ? (
                                <IconButton onClick={() => setId(data['id'])}>
                                    <TrendingDownIcon />
                                </IconButton>
                            ) : isEditable ? (
                                <IconButton onClick={() => setIsEditing(true)}>
                                    <EditIcon />
                                </IconButton>
                            ) : (<></>)
                    }
                />
                <Grid container
                      spacing={1}
                      columnSpacing={{ xs: 12, sm: 8, md: 6 }}
                      direction={'row'}
                      justifyContent={'space-evenly'}
                      alignItems={'center'}
                >
                    {displayBirthday(data)}
                    {displayDeathday(data)}
                    {displayEmail(data)}
                    {displayPhones(data)}
                    {displayAddress(data)}
                </Grid>
            </CardContent>
        </Card>
    );
}

export default function Content() {
    let id;
    [id, setId] = useState(null);
    [caller, setCaller] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    let data;
    [data, setData] = useState(null);
    let isEditing;
    [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        getData(id).then(() => setIsLoading(false));
    }, [id]);

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'calc(100vh - 64px)'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'relative',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100vh - 64px)'
            }}
        >
            <Grid container
                  spacing={1}
                  columnSpacing={{ xs: 12 }}
                  direction={'column'}
                  alignItems={'center'}
            >
                { isEditing ? (
                    <Grid item sx={{ width: '75%' }}>
                        {displayEditCard(data['member'])}
                    </Grid>
                ) : (
                    <>
                        {data['ancestor'] !== data['member']['familyId'] && (
                            <Grid item>
                                <IconButton
                                    size={'large'}
                                    color={'inherit'}
                                    onClick={() => setId(data['ancestor'])}
                                >
                                    <ArrowUpwardIcon/>
                                </IconButton>
                            </Grid>
                        )}
                        <Grid item>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={'spouse' in data ? 6 : 12}>
                                    {displayCard(data['member'])}
                                </Grid>
                                { 'spouse' in data && (
                                    <Grid item xs={12} sm={6}>
                                        {displayCard(data['spouse'])}
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                        {'descendants' in data && (
                            <>
                                <Grid item xs={12} style={{ alignSelf: 'stretch' }}>
                                    <br/><hr style={{ width: '50%' }}/><br/>
                                </Grid>
                                <Grid item>
                                    <Grid container spacing={1} justifyContent={'center'}>
                                        {data['descendants'].map((descendant) => (
                                            <Grid item key={descendant['id']}>
                                                {displayCard(descendant, true)}
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </>
                )}
            </Grid>
        </Box>
    );
}