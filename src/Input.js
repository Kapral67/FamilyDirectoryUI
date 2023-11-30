import {Card, CardContent, FormControl, Grid, IconButton, MenuItem, TextField} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {matchIsValidTel, MuiTelInput} from 'mui-tel-input';
import dayjs from "dayjs";
import EditOffIcon from "@mui/icons-material/EditOff";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import {useState} from "react";
import isEmail from 'validator/lib/isEmail';

const NAME_VALIDATOR_REGEX = /^[A-Za-z\-'_]+$/;
const NAME_VALIDATOR_REGEX_OPT = /^[A-Za-z\-'_]*$/;
const SPECIAL_CHAR_VALIDATOR_REGEX = /^['_-]+[A-Za-z\-'_]*$/;
const EMPTY_PHONE_NUMBER_VALIDATOR_REGEX = /^\+[0-9]+$/;
const MIN_DATE = dayjs('1000-01-01');

function getMaxDate() {
    const now = new Date();
    return dayjs(`${now.getUTCFullYear()+1}-${now.getUTCMonth()+1}-${now.getUTCDate()}`);
}

function getFormattedDate(date) {
    return `${date.year()}-${date.month()+1}-${date.date()}`;
}

export default function Input({setInputState, data = null}) {
    let editedData = data === null
        ? {
            firstName: null,
            middleName: null,
            lastName: null,
            suffix: null,
            birthday: null,
            deathday: null,
            email: null,
            address: [null, null],
            phones: {
                LANDLINE: null,
                MOBILE: null
            }
          }
        : JSON.parse(JSON.stringify(data));
    const [birthday, setBirthday] = useState(editedData['birthday'] === null ? MIN_DATE : dayjs(editedData['birthday']));
    const [mobile, setMobile] = useState('phones' in editedData && 'MOBILE' in editedData['phones'] ? editedData['phones']['MOBILE'] : null);
    const [landline, setLandline] = useState('phones' in editedData && 'LANDLINE' in editedData['phones'] ? editedData['phones']['LANDLINE'] : null);
    const [error, setError] = useState({
        firstName: editedData['firstName'] === null,
        middleName: false,
        lastName: editedData['lastName'] === null,
        suffix: false,
        birthday: editedData['birthday'] === null,
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
                                                const middleName = event.target.value.trim();
                                                editedData['middleName'] = middleName === '' ? null : middleName;
                                                if (editedData['middleName'] !== null && (!NAME_VALIDATOR_REGEX_OPT.test(editedData['middleName']) || SPECIAL_CHAR_VALIDATOR_REGEX.test(editedData['middleName']))) {
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
                                            onChange={(event) => {
                                                const suffix = event.target.value.trim();
                                                editedData['suffix'] = suffix === '' ? null : suffix;
                                            }}
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
                                            minDate={MIN_DATE}
                                            maxDate={getMaxDate()}
                                            label={'Birthday'}
                                            disableFuture
                                            defaultValue={dayjs(data['birthday'])}
                                            slotProps={{ textField: { error: error['birthday'], required: true } }}
                                            onChange={(date, context) => {
                                                if (context.validationError !== null || date === null) {
                                                    setError({
                                                        ...error,
                                                        birthday: true
                                                    });
                                                    editedData['birthday'] = null;
                                                    setBirthday(MIN_DATE);
                                                } else {
                                                    setError({
                                                        ...error,
                                                        birthday: false
                                                    });
                                                    editedData['birthday'] = getFormattedDate(date);
                                                    setBirthday(dayjs(editedData['birthday']));
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl fullWidth>
                                        <DatePicker
                                            minDate={birthday}
                                            maxDate={getMaxDate()}
                                            label={'Deathday'}
                                            disableFuture
                                            defaultValue={'deathday' in data ? dayjs(data['deathday']) : null}
                                            slotProps={{ textField: { error: error['deathday'] } }}
                                            onChange={(date, context) => {
                                                if (context.validationError === null) {
                                                    setError({
                                                        ...error,
                                                        deathday: false
                                                    });
                                                    editedData['deathday'] = (date === null) ? null : getFormattedDate(date);
                                                } else {
                                                    setError({
                                                        ...error,
                                                        deathday: true
                                                    });
                                                    editedData['deathday'] = null;
                                                }
                                            }}
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
                                            onChange={(event) => {
                                                const email = event.target.value.trim();
                                                editedData['email'] = email === '' ? null : email;
                                                if (editedData['email'] === null || isEmail(editedData['email'])) {
                                                    setError({
                                                        ...error,
                                                        email: false
                                                    });
                                                } else {
                                                    setError({
                                                        ...error,
                                                        email: true
                                                    });
                                                }
                                            }}
                                            error={error['email']}
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
                                        <MuiTelInput
                                            label={'Mobile Phone'}
                                            defaultCountry={'US'}
                                            preferredCountries={['US']}
                                            forceCallingCode
                                            focusOnSelectCountry
                                            value={mobile}
                                            onChange={(newMobile) => {
                                                setMobile(newMobile);
                                                if (!EMPTY_PHONE_NUMBER_VALIDATOR_REGEX.test(newMobile) && !matchIsValidTel(newMobile)) {
                                                    setError({
                                                        ...error,
                                                        phones: {
                                                            ...error.phones,
                                                            MOBILE: true
                                                        }
                                                    });
                                                    editedData['phones']['MOBILE'] = null;
                                                } else {
                                                    setError({
                                                        ...error,
                                                        phones: {
                                                            ...error.phones,
                                                            MOBILE: false
                                                        }
                                                    });
                                                    editedData['phones']['MOBILE'] = EMPTY_PHONE_NUMBER_VALIDATOR_REGEX.test(newMobile) ? null : newMobile;
                                                }
                                            }}
                                            error={error['phones']['MOBILE']}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl fullWidth>
                                        <MuiTelInput
                                            label={'Landline Phone'}
                                            defaultCountry={'US'}
                                            preferredCountries={['US']}
                                            forceCallingCode
                                            focusOnSelectCountry
                                            value={landline}
                                            onChange={(newLandline) => {
                                                setLandline(newLandline);
                                                if (!EMPTY_PHONE_NUMBER_VALIDATOR_REGEX.test(newLandline) && !matchIsValidTel(newLandline)) {
                                                    setError({
                                                        ...error,
                                                        phones: {
                                                            ...error.phones,
                                                            LANDLINE: true
                                                        }
                                                    });
                                                    editedData['phones']['LANDLINE'] = null;
                                                } else {
                                                    setError({
                                                        ...error,
                                                        phones: {
                                                            ...error.phones,
                                                            LANDLINE: false
                                                        }
                                                    });
                                                    editedData['phones']['LANDLINE'] = EMPTY_PHONE_NUMBER_VALIDATOR_REGEX.test(newLandline) ? null : newLandline;
                                                }
                                            }}
                                            error={error['phones']['LANDLINE']}
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