export const APP_PORT = 4173;
export const APP_ORIGIN = `http://localhost:${APP_PORT}`;

export const SURNAME = 'Doe';
export const AWS_REGION = 'us-east-1';
export const USER_POOL_ID = `${AWS_REGION}_E2eTestPool`;
export const CLIENT_ID = 'e2etestclientid0000000000';
export const AUTH_DOMAIN = 'auth.familydirectory.test';
export const AUTH_ORIGIN = `https://${AUTH_DOMAIN}`;
export const API_ORIGIN = 'https://api.familydirectory.test';
export const COGNITO_IDP_ORIGIN = `https://cognito-idp.${AWS_REGION}.amazonaws.com`;

export const BACKEND_VERSION = '0.94';
export const AGE_OF_MAJORITY = 18;
export const AGE_OF_SUPER_MAJORITY = 25;

export const FIXED_NOW = new Date('2026-06-15T19:00:00Z');

export const APP_ENV: Record<string, string> = {
    REACT_APP_SURNAME: SURNAME,
    REACT_APP_USER_POOL_ID: USER_POOL_ID,
    REACT_APP_CLIENT_ID: CLIENT_ID,
    REACT_APP_AUTH_DOMAIN: AUTH_DOMAIN,
    REACT_APP_REDIRECT_URI: APP_ORIGIN,
    REACT_APP_API_DOMAIN: API_ORIGIN,
    REACT_APP_AWS_REGION: AWS_REGION,
    REACT_APP_BACKEND_VERSION: BACKEND_VERSION,
    REACT_APP_AGE_OF_MAJORITY: String(AGE_OF_MAJORITY),
    REACT_APP_AGE_OF_SUPER_MAJORITY: String(AGE_OF_SUPER_MAJORITY),
};
