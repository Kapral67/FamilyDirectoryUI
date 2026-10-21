import { APP_ORIGIN, AUTH_ORIGIN, CLIENT_ID } from './support/env';
import { JOHN, LINDA } from './support/family';
import { SIGN_IN_PAGE_HEADING } from './support/fakeBackend';
import { expect, test } from './support/test';

test.describe('sign-in', () => {
    test('sends a visitor without a session to the Cognito hosted UI using the PKCE code flow', async ({ page, backend }) => {
        backend.idpHasSession = false;

        await page.goto('/');

        await expect(page.getByRole('heading', { name: SIGN_IN_PAGE_HEADING })).toBeVisible();
        expect(page.url().startsWith(`${AUTH_ORIGIN}/oauth2/authorize?`)).toBe(true);
        const [authorize] = backend.authorizeRequests;
        expect(authorize.get('client_id')).toBe(CLIENT_ID);
        expect(authorize.get('redirect_uri')).toBe(APP_ORIGIN);
        expect(authorize.get('response_type')).toBe('code');
        expect(authorize.get('code_challenge_method')).toBe('S256');
        expect(authorize.get('code_challenge')).toBeTruthy();
        expect(authorize.get('state')).toBeTruthy();
        expect(authorize.get('scope')?.split(' ').sort()).toEqual(['aws.cognito.signin.user.admin', 'email', 'openid', 'profile']);
        expect(backend.apiRequests).toEqual([]);
    });

    test('completes the code exchange, removes the code from the URL and loads the caller\'s own family', async ({ page, backend }) => {
        await page.goto('/');

        await expect(page.getByText('John Robert Doe')).toBeVisible();
        expect(page.url()).toBe(`${APP_ORIGIN}/`);
        expect(backend.tokenRequests).toHaveLength(1);
        const [token] = backend.tokenRequests;
        expect(token.get('grant_type')).toBe('authorization_code');
        expect(token.get('client_id')).toBe(CLIENT_ID);
        expect(token.get('redirect_uri')).toBe(APP_ORIGIN);
        expect(backend.apiRequests).toEqual([{
            method: 'GET', path: '/get', query: {}, body: undefined,
            authorization: `Bearer ${backend.accessTokenFor(JOHN)}`,
        }]);
    });

    test('signs in whoever the hosted UI authenticates', async ({ page, backend }) => {
        backend.signInAs = LINDA;

        await page.goto('/');

        await expect(page.getByText('Linda Doe', { exact: true })).toBeVisible();
        expect(backend.apiRequests[0].authorization).toBe(`Bearer ${backend.accessTokenFor(LINDA)}`);
    });

    test('shows a full-page spinner and no title bar until sign-in completes', async ({ page, backend }) => {
        const hold = backend.holdNext('POST', '/oauth2/token');

        await page.goto('/');
        await hold.arrived;

        await expect(page.getByRole('progressbar')).toBeVisible();
        await expect(page.getByRole('banner')).toHaveCount(0);
        hold.release();
        await expect(page.getByText('John Robert Doe')).toBeVisible();
    });
});

test.describe('session', () => {
    test('survives a reload of the same tab without another trip to the hosted UI', async ({ page, backend }) => {
        await page.goto('/');
        await expect(page.getByText('John Robert Doe')).toBeVisible();

        await page.reload();

        await expect(page.getByText('John Robert Doe')).toBeVisible();
        expect(backend.authorizeRequests).toHaveLength(1);
    });

    test('is scoped to the tab: a new tab must sign in again', async ({ page, context, backend }) => {
        await page.goto('/');
        await expect(page.getByText('John Robert Doe')).toBeVisible();
        backend.idpHasSession = false;

        const secondTab = await context.newPage();
        await secondTab.goto('/');

        await expect(secondTab.getByRole('heading', { name: SIGN_IN_PAGE_HEADING })).toBeVisible();
        expect(backend.authorizeRequests).toHaveLength(2);
    });
});

test.describe('sign-out', () => {
    test('Logout signs out every device, ends the hosted UI session and returns to sign-in', async ({ page, backend }) => {
        await page.goto('/');
        await expect(page.getByText('John Robert Doe')).toBeVisible();
        const accessToken = backend.accessTokenFor(JOHN);

        await page.getByRole('button', { name: 'Logout' }).click();

        await expect(page.getByRole('heading', { name: SIGN_IN_PAGE_HEADING })).toBeVisible();
        expect(backend.cognitoCalls).toEqual([
            { target: 'AWSCognitoIdentityProviderService.GlobalSignOut', body: { AccessToken: accessToken } },
        ]);
        expect(backend.logoutRequests).toHaveLength(1);
        expect(backend.logoutRequests[0].get('client_id')).toBe(CLIENT_ID);
        expect(backend.logoutRequests[0].get('logout_uri')).toBe(APP_ORIGIN);
    });

    test('a 401 from the API signs the user out the same way', async ({ page, backend }) => {
        backend.failNext('GET', '/get', 401);

        await page.goto('/');

        await expect(page.getByRole('heading', { name: SIGN_IN_PAGE_HEADING })).toBeVisible();
        expect(backend.cognitoCalls.map(c => c.target)).toEqual(['AWSCognitoIdentityProviderService.GlobalSignOut']);
        expect(backend.logoutRequests).toHaveLength(1);
    });
});
