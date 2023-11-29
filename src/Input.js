import {Card, CardContent, FormControl, Grid, IconButton, MenuItem, TextField} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import EditOffIcon from "@mui/icons-material/EditOff";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import {useState} from "react";

const NAME_VALIDATOR_REGEX = /^[A-Za-z\-'_]+$/;
const NAME_VALIDATOR_REGEX_OPT = /^[A-Za-z\-'_]*$/;
const SPECIAL_CHAR_VALIDATOR_REGEX = /^['_-]+[A-Za-z\-'_]*$/;

export default function Input({data= null, setInputState}) {
    let editedData = data === null
        ? {
            firstName: '',
            lastName: '',
            birthday: null,
            email: false,
          }
        : JSON.parse(JSON.stringify(data));
    const [error, setError] = useState({
        firstName: false,
        middleName: false,
        lastName: false,
        suffix: false,
        birthday: false,
        deathday: false,
        email: false,
        address: [false, false],
        phones: {
            LANDLINE: false,
            MOBILE: false
        }
    });
    const hasError = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (hasError(obj[key])) {
                    return true;
                }
            } else if (obj[key] === true) {
                return true;
            }
        }
        return false;
    };
    return (
        <Card sx={{ width: '100%', margin: 'auto', display: 'block' }}>
            <CardContent>
                <form>
                    <Grid container
                          spacing={2}
                          direction={'column'}
                          justifyContent={'space-evenly'}
                    >
                        <Grid item>
                            <Grid container
                                  spacing={2}
                                  direction={'row'}
                                  justifyContent={'space-evenly'}
                            >
                                <Grid item>
                                    <FormControl fullWidth>
                                        <TextField
                                            label={'First Name'}
                                            required
                                            fullWidth
                                            defaultValue={data['firstName']}
                                            onChange={(event) => {
                                                editedData['firstName'] = event.target.value.trim();
                                                if (!NAME_VALIDATOR_REGEX.test(editedData['firstName']) || SPECIAL_CHAR_VALIDATOR_REGEX.test(editedData['firstName'])) {
                                                    setError({
                                                        ...error,
                                                        firstName: true
                                                    });
                                                } else {
                                                    setError({
                                                        ...error,
                                                        firstName: false
                                                    });
                                                }
                                                console.log(error['firstName'])
                                            }}
                                            error={error['firstName']}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl fullWidth>
                                        <TextField
                                            label={'Middle Name'}
                                            fullWidth
                                            defaultValue={'middleName' in data ? data['middleName'] : ''}
                                            onChange={(event) => {
                                                editedData['middleName'] = event.target.value.trim();
                                                if (!NAME_VALIDATOR_REGEX_OPT.test(editedData['middleName']) || SPECIAL_CHAR_VALIDATOR_REGEX.test(editedData['middleName'])) {
                                                    setError({
                                                        ...error,
                                                        middleName: true
                                                    });
                                                } else {
                                                    setError({
                                                        ...error,
                                                        middleName: false
                                                    });
                                                }
                                            }}
                                            error={error['middleName']}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl fullWidth>
                                        <TextField
                                            label={'Last Name'}
                                            required
                                            fullWidth
                                            defaultValue={data['lastName']}
                                            onChange={(event) => {
                                                editedData['lastName'] = event.target.value.trim();
                                                if (!NAME_VALIDATOR_REGEX.test(editedData['lastName']) || SPECIAL_CHAR_VALIDATOR_REGEX.test(editedData['lastName'])) {
                                                    setError({
                                                        ...error,
                                                        lastName: true
                                                    });
                                                } else {
                                                    setError({
                                                        ...error,
                                                        lastName: false
                                                    });
                                                }
                                                console.log(error['lastName'])
                                            }}
                                            error={error['lastName']}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl sx={{ minWidth: 90 }}>
                                        <TextField
                                            label={'Suffix'}
                                            select
                                            fullWidth
                                            defaultValue={'suffix' in data ? data['suffix'] : ''}
                                            onChange={(event) => editedData['suffix'] = event.target.value}
                                        >
                                            <MenuItem value={''}><i>None</i></MenuItem>
                                            <MenuItem value={'Jr'}>Jr</MenuItem>
                                            <MenuItem value={'Sr'}>Sr</MenuItem>
                                        </TextField>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid
                                container
                                spacing={2}
                                direction={'row'}
                                justifyContent={'space-evenly'}
                            >
                                <Grid item>
                                    <FormControl fullWidth>
                                        <DatePicker
                                            minDate={dayjs('1000-01-01')}
                                            label={'Birthday'}
                                            disableFuture
                                            defaultValue={dayjs(data['birthday'])}
                                            slotProps={{ textField: { required: true } }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl fullWidth>
                                        <DatePicker
                                            minDate={dayjs('1000-01-01')}
                                            label={'Deathday'}
                                            disableFuture
                                            defaultValue={'deathday' in data ? dayjs(data['deathday']) : null}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid
                                container
                                spacing={2}
                                direction={'row'}
                                justifyContent={'space-evenly'}
                            >
                                <Grid item>
                                    <FormControl fullWidth>
                                        <TextField
                                            label={'Email'}
                                            fullWidth
                                            defaultValue={'email' in data ? data['email'] : ''}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid
                                container
                                spacing={2}
                                direction={'row'}
                                justifyContent={'space-evenly'}
                            >
                                <Grid item>
                                    <FormControl fullWidth>
                                        <TextField
                                            label={'Address Line 1'}
                                            fullWidth
                                            defaultValue={'address' in data ? data['address'][0] : ''}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl fullWidth>
                                        <TextField
                                            label={'Address Line 2'}
                                            fullWidth
                                            defaultValue={'address' in data ? data['address'][1] : ''}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid
                                container
                                spacing={2}
                                direction={'row'}
                                justifyContent={'space-evenly'}
                            >
                                <Grid item>
                                    <FormControl fullWidth>
                                        <TextField
                                            label={'Mobile Phone'}
                                            defaultValue={
                                                'phones' in data && 'MOBILE' in data['phones']
                                                    ? data['phones']['MOBILE']
                                                    : ''
                                            }
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl fullWidth>
                                        <TextField
                                            label={'Landline Phone'}
                                            defaultValue={
                                                'phones' in data && 'LANDLINE' in data['phones']
                                                    ? data['phones']['LANDLINE']
                                                    : ''
                                            }
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
                <Grid container justifyContent={'space-between'}>
                    <Grid item xs={12} style={{ alignSelf: 'stretch' }}><br/></Grid>
                    <Grid item>
                        <IconButton onClick={() => setInputState(false)}>
                            <EditOffIcon />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton disabled={hasError(error)}>
                            <SaveAsIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}