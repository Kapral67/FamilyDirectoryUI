import {Button, Card, CardContent, CardHeader, Grid, IconButton, Snackbar, TextField, Tooltip} from '@mui/material';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import Box from '@mui/material/Box';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

export default function Content() {

    const [isEditing, setIsEditing] = useState(false);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
    };

    const email = 'reallylongemailaddress@reallylongdomain.somelongsubdomain.example.co.uk';

    const [emailSnackbarOpen, setEmailSnackbarOpen] = useState(false);

    const handleEmailClick = () => {
        void navigator.clipboard.writeText(email);
        void setEmailSnackbarOpen(true);
    };

    const handleEmailSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        void setEmailSnackbarOpen(false);
    };

    return (
        <Card sx={{ width: '75%', margin: 'auto', display: 'block' }}>
            <CardContent>
                {isEditing ? (
                    <Box component="form" noValidate autoComplete="off">
                        <TextField label="First Name" defaultValue='John' required />
                        <TextField label="Middle Name" />
                        <TextField label="Last Name" defaultValue='Doe' required />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker label="Birthday" slotProps={{ textField: { required: true } }} />
                        </LocalizationProvider>
                        <Button variant="contained" color="primary" onClick={handleSaveClick}>
                            Save
                        </Button>
                    </Box>
                ) : (
                    <>
                        <CardHeader
                            title="John Micheal Doe Jr"
                            action={
                                <IconButton aria-label="edit" onClick={handleEditClick}>
                                    <EditIcon />
                                </IconButton>
                            }
                        />
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid item xs={12} sm={4} md={4}>
                                <Typography variant="body2">
                                    <b>Birthday:</b>
                                </Typography>
                                <Typography variant="body2">
                                    July 4, 1776
                                </Typography>
                            </Grid>
                            {/*<Grid item xs={12} sm={4} md={4}>*/}
                            {/*    <Typography variant="body2">*/}
                            {/*        <b>Deathday:</b>*/}
                            {/*    </Typography>*/}
                            {/*    <Typography variant="body2">*/}
                            {/*        November 11, 1865*/}
                            {/*    </Typography>*/}
                            {/*</Grid>*/}
                            <Grid item xs={12} sm={4} md={4}>
                                <Typography variant="body2">
                                    <b>Email:</b> <ContentCopyIcon fontSize="x-small" onClick={handleEmailClick} style={{ cursor: 'pointer' }} />
                                </Typography>
                                <Tooltip title="Click to copy">
                                    <Typography variant="body2" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {email}
                                    </Typography>
                                </Tooltip>
                                <Snackbar open={emailSnackbarOpen} autoHideDuration={6000} onClose={handleEmailSnackbarClose} message="Email copied to clipboard" />
                            </Grid>
                            <Grid item xs={12} sm={4} md={4}>
                                <Typography variant="body2">
                                    <b>Mobile Phone:</b>
                                </Typography>
                                <Typography variant="body2">
                                    +1 800-867-5309
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4} md={4}>
                                <Typography variant="body2">
                                    <b>Landline Phone:</b>
                                </Typography>
                                <Typography variant="body2">
                                    +1 800-313-7953
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4} md={4}>
                                <Typography variant="body2">
                                    <b>Address:</b>
                                </Typography>
                                <Typography variant="body2">
                                    330 Prison Rd.
                                </Typography>
                                <Typography variant="body2">
                                    Rockford, IL 45657
                                </Typography>
                            </Grid>
                        </Grid>
                    </>
                )}
            </CardContent>
        </Card>
    );
}