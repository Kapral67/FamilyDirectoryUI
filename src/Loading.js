import Box from "@mui/material/Box";
import {CircularProgress} from "@mui/material";

export default function Loading() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
            }}
        >
            <CircularProgress />
        </Box>
    );
}