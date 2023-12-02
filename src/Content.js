import {
    Alert,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Grid,
    IconButton,
    Snackbar
} from '@mui/material';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import {Auth, API} from "aws-amplify";
import Input from "./Input";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {useConfirm} from "material-ui-confirm";

const SNACKBAR_ANCHOR = { vertical: 'top', horizontal: 'center' };
const SNACKBAR_MARGIN = { mt: '64px' };
const DELETE_MEMBER_WARNING = 'Deleting a Member is permanent. Their data and account, if present, will be lost!';

let setId, caller, setCaller, setData, setIsLoading, setIsEditing, confirmDelete, setOpenSnackBarError, setOpenSnackBarSuccess;

async function getMember (id = null) {
    const init = {
        headers: {
            Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
        },
        ...id && {
            queryStringParameters: {
                id: `${id}`
            }
        }
    };
    return await API.get('HttpApi', '/get', init);
}

async function deleteMember(id) {
    const init = {
        headers: {
            Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
        },
        body: {
            id: id
        }
    }
    return await API.del('HttpApi', '/delete', init);
}

async function getData(id = null) {
    const data = await getMember(id);
    if (id === null) {
        setCaller(data);
    }
    setData(data);
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

function displayCard (data, isDescendant = false, width = '75%') {
    let isEditable = false;
    const isDeletableSpouse = !isDescendant && 'spouse' in caller && caller['member']['id'] === caller['member']['familyId'] && data['id'] === caller['spouse']['id'];
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
        <Card sx={{ width: width, margin: 'auto', display: 'block' }}>
            <CardContent>
                <CardHeader
                    title={['firstName', 'middleName', 'lastName', 'suffix'].map(key => data[key]).filter(Boolean).join(' ')}
                    action={isDescendant ? (
                                <IconButton onClick={() => setId(data['id'])}>
                                    <TrendingDownIcon />
                                </IconButton>
                            ) :
                                <>
                                    {isDeletableSpouse && (
                                        <IconButton
                                            onClick={() => {
                                                confirmDelete({
                                                    confirmationText: 'Delete',
                                                    description: DELETE_MEMBER_WARNING,
                                                    confirmationButtonProps: { color: 'error' },
                                                    cancellationButtonProps: { color: 'info' }
                                                }).then(() => {
                                                        setIsLoading(true);
                                                        deleteMember(data['id'])
                                                            .then(() => {
                                                                getData().then(() => setIsLoading(false));
                                                                setOpenSnackBarSuccess(true);
                                                            })
                                                            .catch(() => {
                                                                setIsLoading(false);
                                                                setOpenSnackBarError(true);
                                                            });
                                                    })
                                                    .catch(() => {});
                                            }}
                                        >
                                            <DeleteForeverIcon />
                                        </IconButton>
                                    )}
                                    {isEditable && (
                                        <IconButton onClick={() => setIsEditing({ data: data, value: true })}>
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                </>
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
    confirmDelete = useConfirm();
    let id;
    [id, setId] = useState(null);
    [caller, setCaller] = useState(null);
    let isLoading;
    [isLoading, setIsLoading] = useState(true);
    let data;
    [data, setData] = useState(null);
    let isEditing;
    [isEditing, setIsEditing] = useState({
        data: null,
        value: false
    });
    const [isCreatingDescendant, setIsCreatingDescendant] = useState(false);
    const [isCreatingSpouse, setIsCreatingSpouse] = useState(false);
    let openSnackBarError, openSnackBarSuccess;
    [openSnackBarError, setOpenSnackBarError] = useState(false);
    [openSnackBarSuccess, setOpenSnackBarSuccess] = useState(false);

    const handleSnackBarClose = () => {
        setOpenSnackBarError(false);
        setOpenSnackBarSuccess(false);
    };

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
            <Snackbar
                anchorOrigin={SNACKBAR_ANCHOR}
                open={openSnackBarError}
                autoHideDuration={6000}
                onClose={handleSnackBarClose}
                sx={SNACKBAR_MARGIN}
            >
                <Alert variant={'filled'} severity={'error'} sx={{ width: '100%' }}>Error!</Alert>
            </Snackbar>
            <Snackbar
                anchorOrigin={SNACKBAR_ANCHOR}
                open={openSnackBarSuccess}
                autoHideDuration={6000}
                onClose={handleSnackBarClose}
                sx={SNACKBAR_MARGIN}
            >
                <Alert variant={'filled'} severity={'success'}>Success!</Alert>
            </Snackbar>
            <Grid container
                  spacing={1}
                  columnSpacing={{ xs: 12 }}
                  direction={'column'}
                  alignItems={'center'}
                  sx={{ mt: 2, mb: 2 }}
            >
                { isEditing['value'] || isCreatingDescendant || isCreatingSpouse ? (
                    <Grid item sx={{ width: '75%' }}>
                        {isEditing['value'] && (
                            <Input data={isEditing['data']}
                                   setInputState={setIsEditing}
                                   setIsLoading={setIsLoading}
                                   getData={getData}
                                   setOpenSnackBarSuccess={setOpenSnackBarSuccess}
                                   setOpenSnackBarError={setOpenSnackBarError}
                            />
                        )}
                        {isCreatingDescendant && (
                            <Input setInputState={setIsCreatingDescendant}
                                   setIsLoading={setIsLoading}
                                   getData={getData}
                                   setOpenSnackBarSuccess={setOpenSnackBarSuccess}
                                   setOpenSnackBarError={setOpenSnackBarError}
                            />
                        )}
                        {isCreatingSpouse && (
                            <Input setInputState={setIsCreatingSpouse}
                                   setIsLoading={setIsLoading}
                                   getData={getData}
                                   setOpenSnackBarSuccess={setOpenSnackBarSuccess}
                                   setOpenSnackBarError={setOpenSnackBarError}
                                   isSpouse={true}
                            />
                        )}
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
                                    <ArrowUpwardIcon />
                                </IconButton>
                            </Grid>
                        )}
                        <Grid item>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={'spouse' in data ? 6 : 12}>
                                    {!('spouse' in data) && caller['member']['familyId'] === data['member']['familyId'] ? (
                                        <Grid container
                                              spacing={1}
                                              direction={'row'}
                                              justifyContent={'center'}
                                              alignItems={'center'}
                                        >
                                            <Grid item xs={9}>
                                                {displayCard(data['member'], false, 'fit-content')}
                                            </Grid>
                                            <Grid item xs={1}>
                                                <IconButton
                                                    size={'large'}
                                                    color={'inherit'}
                                                    onClick={() => setIsCreatingSpouse(true)}
                                                >
                                                    <PersonAddAlt1Icon />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    ) : displayCard(data['member'])
                                    }
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
                                    <Grid container
                                          spacing={1}
                                          justifyContent={'center'}
                                    >
                                        {data['descendants'].map((descendant) => (
                                            <Grid item key={descendant['id']}>
                                                {displayCard(descendant, true)}
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                            </>
                        )}
                        {data['member']['familyId'] === caller['member']['familyId'] && (
                            <Grid item>
                                <IconButton
                                    size={'large'}
                                    color={'inherit'}
                                    onClick={() => setIsCreatingDescendant(true)}
                                >
                                    <GroupAddIcon />
                                </IconButton>
                            </Grid>
                        )}
                    </>
                )}
            </Grid>
        </Box>
    );
}