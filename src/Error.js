import Box from "@mui/material/Box";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Typography from "@mui/material/Typography";

export default function Error() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}
        >
            <ErrorOutlineIcon color="error" fontSize="large" />
            <Typography variant="h4" color="error" sx={{ mt: 2 }}>
                An error occurred
            </Typography>
        </Box>
    );
}