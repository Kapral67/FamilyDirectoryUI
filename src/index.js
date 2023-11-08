import { Amplify } from 'aws-amplify';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from "./App";
import {createTheme, ThemeProvider} from "@mui/material";
import Box from "@mui/material/Box";

Amplify.configure({
    Auth: {
        // REQUIRED - Amazon Cognito Region
        region: process.env.REACT_APP_AWS_REGION,

        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: process.env.REACT_APP_USER_POOL_ID,

        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,

        // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
        mandatorySignIn: true,

        // OPTIONAL - Hosted UI configuration
        oauth: {
            domain: process.env.REACT_APP_AUTH_DOMAIN,
            scope: [
                'email',
                'profile',
                'openid',
                'aws.cognito.signin.user.admin',
            ],
            redirectSignIn: process.env.REACT_APP_REDIRECT_URI,
            redirectSignOut: process.env.REACT_APP_REDIRECT_URI,
            responseType: 'code',
        },
    },
    API: {
        endpoints: [
            {
                name: "HttpApi",
                endpoint: process.env.REACT_APP_API_DOMAIN
            }
        ]
    },
    storage: sessionStorage
});

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#888888'
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
            }}
            >
                <App />
            </Box>
        </ThemeProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
