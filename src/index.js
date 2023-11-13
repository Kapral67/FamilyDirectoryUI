import { Amplify } from 'aws-amplify';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from "./App";
import {createTheme, ThemeProvider} from "@mui/material";

document.title = `${process.env.REACT_APP_SURNAME} Family Directory`;

Amplify.configure({
    Auth: {
        region: process.env.REACT_APP_AWS_REGION,
        userPoolId: process.env.REACT_APP_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,
        mandatorySignIn: true,
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
        secondary: {
            main: '#ffffff'
        }
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
