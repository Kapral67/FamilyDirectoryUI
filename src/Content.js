import {Button, Card, CardContent, CardHeader, Grid, IconButton, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useState} from "react";
import Box from "@mui/material/Box";
import EditIcon from '@mui/icons-material/Edit';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function Content() {

    const [isEditing, setIsEditing] = useState(false);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
    };

    return (
        <Card sx={{ width: '50%', margin: 'auto', display: 'block' }}>
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
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    <b>Birthday:</b> July 4, 1776
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    <b>Deathday:</b> November 11, 1865
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    <b>Email:</b> johnnydoe@example.com
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    <b>Mobile Phone:</b> +1 800-867-5309
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    <b>Landline Phone:</b> +1 800-313-7953
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2">
                                    <b>Address Line 1:</b> 330 Prison Rd.
                                </Typography>
                                <Typography variant="body2">
                                    <b>Address Line 2:</b> Rockford, IL 45657
                                </Typography>
                            </Grid>
                        </Grid>
                    </>
                )}
            </CardContent>
        </Card>
    );
}