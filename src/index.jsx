
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { sessionStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material';

document.title = `${import.meta.env.REACT_APP_SURNAME} Family Directory`;

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.REACT_APP_USER_POOL_ID,
            userPoolClientId: import.meta.env.REACT_APP_CLIENT_ID,
            signUpVerificationMethod: 'code',
            loginWith: {
                oauth: {
                    domain: import.meta.env.REACT_APP_AUTH_DOMAIN,
                    scopes: [
                        'email',
                        'profile',
                        'openid',
                        'aws.cognito.signin.user.admin',
                    ],
                    redirectSignIn: [import.meta.env.REACT_APP_REDIRECT_URI],
                    redirectSignOut: [import.meta.env.REACT_APP_REDIRECT_URI],
                    responseType: 'code',
                },
            }
        }
    },
    API: {
        REST: {
            HttpApi: {
                endpoint: import.meta.env.REACT_APP_API_DOMAIN,
                region: import.meta.env.REACT_APP_AWS_REGION
            }
        }
    }
}, {
    API: {
        REST: {
            headers: async () => {
                return { Authorization: `Bearer ${(await fetchAuthSession()).tokens?.accessToken.toString()}` };
            }
        }
    }
});

cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage);

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
