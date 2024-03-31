
import { put, post } from 'aws-amplify/api';
import { matchIsValidTel, MuiTelInput } from 'mui-tel-input';
import dayjs from 'dayjs';
import { useState } from 'react';
import isEmail from 'validator/lib/isEmail';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import EditOffIcon from '@mui/icons-material/EditOff';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled';

const NAME_VALIDATOR_REGEX = /^[A-Za-z\-'_]+$/;
const NAME_VALIDATOR_REGEX_OPT = /^[A-Za-z\-'_]*$/;
const SPECIAL_CHAR_VALIDATOR_REGEX = /^['_-]+[A-Za-z\-'_]*$/;
const EMPTY_PHONE_NUMBER_VALIDATOR_REGEX = /^\+[0-9]+$/;
const WHITESPACE_MATCHER_REGEX = /\s/g;
const MIN_DATE = dayjs('1000-01-01');
const DAGGER = '†';

async function updateMember(request) {
    const restOperation = put({
        apiName: 'HttpApi',
        path: '/update',
        options: {
            body: request
        }
    });
    await restOperation.response;
}

async function createMember(request) {
    const restOperation = post({
        apiName: 'HttpApi',
        path: '/create',
        options: {
            body: request
        }
    });
    await restOperation.response;
}

function getMaxDate() {
    const now = new Date();
    return dayjs(`${now.getUTCFullYear()+1}-${now.getUTCMonth()+1}-${now.getUTCDate()}`);
}

function getFormattedDate(date) {
    let month = date.month()+1;
    if (month < 10) {
        month = `0${month}`;
    }
    let day = date.date();
    if (day < 10) {
        day = `0${day}`;
    }
    return `${date.year()}-${month}-${day}`;
}

function getInitialState(data) {
    let initialState = {
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        birthday: '',
        deathday: '',
        email: '',
        address: ['', '', ''],
        phones: {
            LANDLINE: '',
            MOBILE: ''
        }
    };
    if (data !== null) {
        const d = JSON.parse(JSON.stringify(data));
        if ('firstName' in d) {
            initialState['firstName'] = d['firstName'];
        }
        if ('middleName' in d) {
            initialState['middleName'] = d['middleName'];
        }
        if ('lastName' in d) {
            initialState['lastName'] = d['lastName'];
        }
        if ('suffix' in d) {
            initialState['suffix'] = d['suffix'];
        }
        if ('birthday' in d) {
            initialState['birthday'] = d['birthday'];
        }
        if ('deathday' in d) {
            initialState['deathday'] = d['deathday'];
        }
        if ('email' in d) {
            initialState['email'] = d['email'];
        }
        if ('address' in d && Array.isArray(d['address']) && d['address'].length > 1) {
            initialState['address'][0] = d['address'][0];
            initialState['address'][1] = d['address'][1];
            if (d['address'].length > 2) {
                initialState['address'][2] = d['address'][2];
            }
        }
        if ('phones' in d) {
            if ('MOBILE' in d['phones']) {
                initialState['phones']['MOBILE'] = d['phones']['MOBILE'];
            }
            if ('LANDLINE' in d['phones']) {
                initialState['phones']['LANDLINE'] = d['phones']['LANDLINE'];
            }
        }
    }
    return initialState;
}

export default function Input({
                                  setInputState,
                                  setIsLoading,
                                  getData,
                                  setOpenSnackBarSuccess,
                                  setOpenSnackBarError,
                                  data = null,
                                  isSpouse = false,
                                  ancestor = null
}) {
    const isCreate = data === null;
    const initialState = getInitialState(data);
    const [firstName, setFirstName] = useState(initialState['firstName']);
    const [middleName, setMiddleName] = useState(initialState['middleName']);
    const [lastName, setLastName] = useState(initialState['lastName']);
    const [suffix, setSuffix] = useState(initialState['suffix']);
    const [birthday, setBirthday] = useState(initialState['birthday']);
    const [deathday, setDeathday] = useState(initialState['deathday']);
    const [email, setEmail] = useState(initialState['email']);
    const [address, setAddress] = useState(initialState['address']);
    const [phones, setPhones] = useState(initialState['phones']);

    const [error, setError] = useState({
        firstName: initialState['firstName'] === '',
        middleName: false,
        lastName: initialState['lastName'] === '',
        suffix: false,
        birthday: initialState['birthday'] === '',
        deathday: false,
        email: false,
        address: [false, false, false],
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
    const isInitialState = () => JSON.stringify(firstName) === JSON.stringify(initialState['firstName']) &&
                                JSON.stringify(middleName) === JSON.stringify(initialState['middleName']) &&
                                JSON.stringify(lastName) === JSON.stringify(initialState['lastName']) &&
                                JSON.stringify(suffix) === JSON.stringify(initialState['suffix']) &&
                                JSON.stringify(birthday) === JSON.stringify(initialState['birthday']) &&
                                JSON.stringify(deathday) === JSON.stringify(initialState['deathday']) &&
                                JSON.stringify(email) === JSON.stringify(initialState['email']) &&
                                JSON.stringify(address) === JSON.stringify(initialState['address']) &&
                                JSON.stringify(phones) === JSON.stringify(initialState['phones']);
    const closeInputState = () => setInputState(isCreate ? false : { data: null, value: false });
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
                                            defaultValue={firstName}
                                            onChange={(event) => {
                                                const first_name = event.target.value.trim();
                                                setFirstName(first_name);
                                                setError({
                                                    ...error,
                                                    firstName: !NAME_VALIDATOR_REGEX.test(first_name) || SPECIAL_CHAR_VALIDATOR_REGEX.test(first_name)
                                                });
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
                                            defaultValue={middleName}
                                            onChange={(event) => {
                                                const middle_name = event.target.value.trim();
                                                setMiddleName(middle_name);
                                                setError({
                                                    ...error,
                                                    middleName: !NAME_VALIDATOR_REGEX_OPT.test(middle_name) || SPECIAL_CHAR_VALIDATOR_REGEX.test(middle_name)
                                                });
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
                                            defaultValue={lastName}
                                            onChange={(event) => {
                                                const last_name = event.target.value.trim();
                                                setLastName(last_name);
                                                setError({
                                                    ...error,
                                                    lastName: !NAME_VALIDATOR_REGEX.test(last_name) || SPECIAL_CHAR_VALIDATOR_REGEX.test(last_name)
                                                });
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
                                            defaultValue={suffix}
                                            onChange={(event) => setSuffix(event.target.value.replaceAll(WHITESPACE_MATCHER_REGEX, ''))}
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
                                            defaultValue={birthday === '' ? null : dayjs(birthday)}
                                            slotProps={{ textField: { error: error['birthday'], required: true } }}
                                            onChange={(date, context) => {
                                                const birthdayHasError = context.validationError !== null || date === null;
                                                setError({
                                                    ...error,
                                                    birthday: birthdayHasError
                                                });
                                                setBirthday(birthdayHasError ? '' : getFormattedDate(date));
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl fullWidth>
                                        <DatePicker
                                            minDate={birthday === '' ? MIN_DATE : dayjs(birthday)}
                                            maxDate={getMaxDate()}
                                            label={'Deathday'}
                                            disableFuture
                                            defaultValue={deathday === '' ? null : dayjs(deathday)}
                                            slotProps={{
                                                actionBar: {
                                                    actions: ['clear', 'cancel', 'accept']
                                                },
                                                field: {
                                                    clearable: true
                                                },
                                                textField: {
                                                    error: error['deathday']
                                                }
                                            }}
                                            onChange={(date, context) => {
                                                const deathdayHasError = context.validationError !== null;
                                                setError({
                                                    ...error,
                                                    deathday: deathdayHasError
                                                });
                                                setDeathday(deathdayHasError || date === null ? '' : getFormattedDate(date));
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
                                            defaultValue={email}
                                            onChange={(event) => {
                                                const e_mail = event.target.value.replaceAll(WHITESPACE_MATCHER_REGEX, '');
                                                setEmail(e_mail);
                                                setError({
                                                    ...error,
                                                    email: e_mail.includes(DAGGER) || (e_mail !== '' && !isEmail(e_mail))
                                                });
                                            }}
                                            error={error['email']}
                                            disabled={deathday !== ''}
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
                                            defaultValue={address[0]}
                                            onChange={(event) => {
                                                const addressLine1 = event.target.value.trim().replaceAll(WHITESPACE_MATCHER_REGEX, ' ');
                                                setAddress([addressLine1, address[1], address[2]]);
                                                setError({
                                                    ...error,
                                                    address: [
                                                        addressLine1.includes(DAGGER),
                                                        (address[1] === '' && addressLine1 !== '') || (addressLine1 === '' && address[1] !== ''),
                                                        address[2]
                                                    ]
                                                });
                                            }}
                                            error={error['address'][0]}
                                            disabled={deathday !== ''}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl fullWidth>
                                        <TextField
                                            label={'Address Line 2'}
                                            fullWidth
                                            defaultValue={address[1]}
                                            onChange={(event) => {
                                                const addressLine2 = event.target.value.trim().replaceAll(WHITESPACE_MATCHER_REGEX, ' ');
                                                setAddress([address[0], addressLine2, address[2]]);
                                                setError({
                                                    ...error,
                                                    address: [
                                                        error['address'][0],
                                                        addressLine2.includes(DAGGER) || (addressLine2 !== '' && address[0] === '') || (addressLine2 === '' && (address[0] !== '' || address[2] !== '')),
                                                        error['address'][2]
                                                    ]
                                                });
                                            }}
                                            required={address[0] !== '' || address[2] !== ''}
                                            disabled={deathday !== '' || (address[0] === '' && address[1] === '')}
                                            error={error['address'][1]}
                                        />
                                    </FormControl>
                                </Grid>
                                {parseFloat(process.env.REACT_APP_BACKEND_VERSION) >= 0.71 && (
                                    <Grid item>
                                        <FormControl fullWidth>
                                            <TextField
                                                label={'Address Line 3'}
                                                fullWidth
                                                defaultValue={address[2]}
                                                onChange={(event) => {
                                                    const addressLine3 = event.target.value.trim().replaceAll(WHITESPACE_MATCHER_REGEX, ' ');
                                                    setAddress([address[0], address[1], addressLine3]);
                                                    setError({
                                                        ...error,
                                                        address: [
                                                            error['address'][0],
                                                            error['address'][1],
                                                            addressLine3.includes(DAGGER) || (addressLine3 !== '' && (address[0] === '' || address[1] === ''))
                                                        ]
                                                    });
                                                }}
                                                required={false}
                                                disabled={deathday !== '' || ((address[0] === '' || address[1] === '') && address[2] === '')}
                                                error={error['address'][2]}
                                            />
                                        </FormControl>
                                    </Grid>
                                )}
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
                                            value={phones['MOBILE']}
                                            onChange={(newMobile) => {
                                                setPhones({
                                                    ...phones,
                                                    MOBILE: newMobile
                                                });
                                                setError({
                                                    ...error,
                                                    phones: {
                                                        ...error.phones,
                                                        MOBILE: !EMPTY_PHONE_NUMBER_VALIDATOR_REGEX.test(newMobile) && !matchIsValidTel(newMobile)
                                                    }
                                                });
                                            }}
                                            error={error['phones']['MOBILE']}
                                            disabled={deathday !== ''}
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
                                            value={phones['LANDLINE']}
                                            onChange={(newLandline) => {
                                                setPhones({
                                                    ...phones,
                                                    LANDLINE: newLandline
                                                });
                                                setError({
                                                    ...error,
                                                    phones: {
                                                        ...error.phones,
                                                        LANDLINE: !EMPTY_PHONE_NUMBER_VALIDATOR_REGEX.test(newLandline) && !matchIsValidTel(newLandline)
                                                    }
                                                });
                                            }}
                                            error={error['phones']['LANDLINE']}
                                            disabled={deathday !== ''}
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
                        <IconButton onClick={closeInputState}>
                            {isCreate ? (
                                <PersonAddDisabledIcon />
                            ) : (
                                <EditOffIcon />
                            )}
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton
                            disabled={isInitialState() || hasError(error)}
                            onClick={() => {
                                let telephones = JSON.parse(JSON.stringify(phones));
                                if (EMPTY_PHONE_NUMBER_VALIDATOR_REGEX.test(telephones['MOBILE'])) {
                                    telephones['MOBILE'] = '';
                                }
                                if (EMPTY_PHONE_NUMBER_VALIDATOR_REGEX.test(telephones['LANDLINE'])) {
                                    telephones['LANDLINE'] = '';
                                }
                                const member = {
                                    firstName: firstName,
                                    middleName: middleName === '' ? null : middleName,
                                    lastName: lastName,
                                    suffix: suffix === '' ? null : suffix,
                                    birthday: birthday,
                                    deathday: deathday === '' ? null : deathday,
                                    email: email === '' ? null : email,
                                    address: address[0] === '' || address[1] === '' ? null : address[2] === '' ? [address[0], address[1]] : address,
                                    phones: telephones['LANDLINE'] === '' && telephones['MOBILE'] === '' ? null : telephones
                                };
                                if (isCreate) {
                                    setIsLoading(true);
                                    const request = { member: member, isSpouse: isSpouse, ...(parseFloat(process.env.REACT_APP_BACKEND_VERSION) > 0.5 && { ancestor: ancestor }) };
                                    createMember(request)
                                        .then(() => {
                                            closeInputState();
                                            getData(ancestor).then(() => setIsLoading(false));
                                            setOpenSnackBarSuccess(true);
                                        })
                                        .catch(() => {
                                            setIsLoading(false);
                                            setOpenSnackBarError(true);
                                        });
                                } else {
                                    setIsLoading(true);
                                    updateMember({ id: data['id'], member: member })
                                        .then(() => {
                                            closeInputState();
                                            getData(ancestor !== null ? ancestor : data['id']).then(() => setIsLoading(false));
                                            setOpenSnackBarSuccess(true);
                                        })
                                        .catch(() => {
                                            setIsLoading(false);
                                            setOpenSnackBarError(true);
                                        });
                                }
                            }}
                        >
                            <SaveAsIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}