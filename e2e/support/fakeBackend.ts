import { createHash } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { BrowserContext, Request, Route } from '@playwright/test';
import {
    API_ORIGIN,
    APP_ORIGIN,
    AUTH_ORIGIN,
    CLIENT_ID,
    COGNITO_IDP_ORIGIN,
    FIXED_NOW,
    SURNAME,
    USER_POOL_ID,
} from './env';
import { FamilyStore, JOHN, NotFound } from './family';

export interface ApiRequest {
    method: string;
    path: string;
    query: Record<string, string>;
    body: unknown;
    authorization: string | undefined;
}

export interface Hold {
    arrived: Promise<void>;
    release(): void;
}

interface Failure {
    method: string;
    path: string;
    status: number;
}

interface PendingHold extends Hold {
    method: string;
    path: string;
    markArrived(): void;
    released: Promise<void>;
}

export const SIGN_IN_PAGE_HEADING = 'Fake Cognito Hosted UI';

export class FakeBackend {
    readonly store = new FamilyStore();
    signInAs = JOHN;
    idpHasSession = true;
    pdf = { contentType: 'application/pdf', body: Buffer.from('%PDF-1.4 e2e fake directory') };

    readonly apiRequests: ApiRequest[] = [];
    readonly authorizeRequests: URLSearchParams[] = [];
    readonly tokenRequests: URLSearchParams[] = [];
    readonly logoutRequests: URLSearchParams[] = [];
    readonly cognitoCalls: { target: string; body: Record<string, unknown> }[] = [];
    readonly unexpectedRequests: string[] = [];
    readonly presignedUrlRequests: { url: string; authorization: string | undefined }[] = [];

    private readonly issuedCodes = new Map<string, { memberId: string; challenge: string }>();
    private readonly accessTokens = new Map<string, string>();
    private readonly failures: Failure[] = [];
    private readonly holds: PendingHold[] = [];
    private codeCounter = 0;
    private presignedUrlServer: Server | undefined;
    private presignedUrlOrigin = '';

    async install(context: BrowserContext): Promise<void> {
        await this.startPresignedUrlServer();
        await context.route('**/*', route => this.handleUnexpected(route));
        await context.route(`${AUTH_ORIGIN}/**`, route => this.handleHostedUi(route));
        await context.route(`${COGNITO_IDP_ORIGIN}/**`, route => this.handleCognitoIdp(route));
        await context.route(`${API_ORIGIN}/**`, route => this.handleApi(route));
    }

    async dispose(): Promise<void> {
        await new Promise(resolve => this.presignedUrlServer?.close(resolve));
    }

    private async startPresignedUrlServer(): Promise<void> {
        this.presignedUrlServer = createServer((request, response) => {
            this.presignedUrlRequests.push({ url: request.url ?? '', authorization: request.headers.authorization });
            response.writeHead(200, { 'access-control-allow-origin': '*', 'content-type': this.pdf.contentType });
            response.end(this.pdf.body);
        });
        await new Promise<void>(resolve => this.presignedUrlServer!.listen(0, '127.0.0.1', resolve));
        this.presignedUrlOrigin = `http://127.0.0.1:${(this.presignedUrlServer.address() as AddressInfo).port}`;
    }

    accessTokenFor(memberId: string): string {
        for (const [token, id] of this.accessTokens) {
            if (id === memberId) {
                return token;
            }
        }
        throw new Error(`no access token issued for ${memberId}`);
    }

    failNext(method: string, path: string, status: number, times = 1): void {
        for (let i = 0; i < times; i++) {
            this.failures.push({ method, path, status });
        }
    }

    holdNext(method: string, path: string): Hold {
        let markArrived!: () => void;
        let release!: () => void;
        const arrived = new Promise<void>(resolve => (markArrived = resolve));
        const released = new Promise<void>(resolve => (release = resolve));
        const hold: PendingHold = { method, path, arrived, release, released, markArrived };
        this.holds.push(hold);
        return hold;
    }

    requests(method: string, path: string): ApiRequest[] {
        return this.apiRequests.filter(r => r.method === method && r.path === path);
    }

    private async handleUnexpected(route: Route): Promise<void> {
        const url = new URL(route.request().url());
        if (url.origin === APP_ORIGIN || url.origin === this.presignedUrlOrigin) {
            await route.fallback();
            return;
        }
        this.unexpectedRequests.push(`${route.request().method()} ${route.request().url()}`);
        await route.abort('blockedbyclient');
    }

    private async takeHold(method: string, path: string): Promise<void> {
        const index = this.holds.findIndex(h => h.method === method && h.path === path);
        if (index === -1) {
            return;
        }
        const [hold] = this.holds.splice(index, 1);
        hold.markArrived();
        await hold.released;
    }

    private takeFailure(method: string, path: string): Failure | undefined {
        const index = this.failures.findIndex(f => f.method === method && f.path === path);
        return index === -1 ? undefined : this.failures.splice(index, 1)[0];
    }

    private async handleHostedUi(route: Route): Promise<void> {
        const request = route.request();
        const url = new URL(request.url());
        if (request.method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: preflightHeaders(request) });
            return;
        }
        switch (url.pathname) {
            case '/oauth2/authorize':
                this.authorizeRequests.push(url.searchParams);
                await this.authorize(route, url.searchParams);
                return;
            case '/login':
                this.idpHasSession = true;
                await this.authorize(route, url.searchParams);
                return;
            case '/oauth2/token':
                await this.token(route);
                return;
            case '/logout':
                this.logoutRequests.push(url.searchParams);
                this.idpHasSession = false;
                await route.fulfill({ status: 302, headers: { location: url.searchParams.get('logout_uri') ?? '/' } });
                return;
            default:
                this.unexpectedRequests.push(`${request.method()} ${request.url()}`);
                await route.fulfill({ status: 404 });
        }
    }

    private async authorize(route: Route, params: URLSearchParams): Promise<void> {
        if (!this.idpHasSession) {
            await route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: `<!doctype html><title>Sign in</title><h1>${SIGN_IN_PAGE_HEADING}</h1>`
                    + `<form action="/login" method="get">`
                    + [...params].map(([k, v]) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}">`).join('')
                    + `<button type="submit">Sign in</button></form>`,
            });
            return;
        }
        const code = `e2e-code-${++this.codeCounter}`;
        this.issuedCodes.set(code, { memberId: this.signInAs, challenge: params.get('code_challenge') ?? '' });
        const redirect = new URL(params.get('redirect_uri') ?? APP_ORIGIN);
        redirect.searchParams.set('code', code);
        redirect.searchParams.set('state', params.get('state') ?? '');
        await route.fulfill({ status: 302, headers: { location: redirect.toString() } });
    }

    private async token(route: Route): Promise<void> {
        const form = new URLSearchParams(route.request().postData() ?? '');
        this.tokenRequests.push(form);
        await this.takeHold('POST', '/oauth2/token');
        const issued = this.issuedCodes.get(form.get('code') ?? '');
        const verifier = form.get('code_verifier') ?? '';
        if (!issued || createHash('sha256').update(verifier).digest('base64url') !== issued.challenge) {
            await route.fulfill({ status: 400, headers: corsHeaders(), json: { error: 'invalid_grant' } });
            return;
        }
        this.issuedCodes.delete(form.get('code')!);
        const iat = Math.floor(FIXED_NOW.getTime() / 1000);
        const exp = iat + 24 * 60 * 60;
        const username = `user-${issued.memberId}`;
        const accessToken = unsignedJwt({
            sub: issued.memberId, username, client_id: CLIENT_ID, token_use: 'access',
            scope: 'aws.cognito.signin.user.admin openid profile email',
            iss: `${COGNITO_IDP_ORIGIN}/${USER_POOL_ID}`, iat, exp, jti: `jti-${this.codeCounter}`,
        });
        const idToken = unsignedJwt({
            sub: issued.memberId, 'cognito:username': username, aud: CLIENT_ID, token_use: 'id',
            iss: `${COGNITO_IDP_ORIGIN}/${USER_POOL_ID}`, iat, exp,
        });
        this.accessTokens.set(accessToken, issued.memberId);
        await route.fulfill({
            status: 200,
            headers: corsHeaders(),
            json: {
                access_token: accessToken, id_token: idToken, refresh_token: `refresh-${this.codeCounter}`,
                token_type: 'Bearer', expires_in: exp - iat,
            },
        });
    }

    private async handleCognitoIdp(route: Route): Promise<void> {
        const request = route.request();
        if (request.method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: preflightHeaders(request) });
            return;
        }
        const target = request.headers()['x-amz-target'] ?? '';
        const body = JSON.parse(request.postData() ?? '{}');
        this.cognitoCalls.push({ target, body });
        if (target === 'AWSCognitoIdentityProviderService.GlobalSignOut') {
            this.accessTokens.delete(body.AccessToken);
        }
        await route.fulfill({ status: 200, headers: corsHeaders(), contentType: 'application/x-amz-json-1.1', body: '{}' });
    }

    private async handleApi(route: Route): Promise<void> {
        const request = route.request();
        if (request.method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: preflightHeaders(request) });
            return;
        }
        const url = new URL(request.url());
        const method = request.method();
        const path = url.pathname;
        const authorization = request.headers()['authorization'];
        const raw = request.postData();
        this.apiRequests.push({
            method, path, authorization,
            query: Object.fromEntries(url.searchParams),
            body: raw ? JSON.parse(raw) : undefined,
        });

        await this.takeHold(method, path);
        const failure = this.takeFailure(method, path);
        if (failure) {
            await route.fulfill({ status: failure.status, headers: corsHeaders(), json: { message: 'injected failure' } });
            return;
        }

        const callerId = this.accessTokens.get(authorization?.replace(/^Bearer /, '') ?? '');
        if (!callerId) {
            await route.fulfill({ status: 401, headers: corsHeaders(), json: { message: 'Unauthorized' } });
            return;
        }

        try {
            const body = raw ? JSON.parse(raw) : undefined;
            switch (`${method} ${path}`) {
                case 'GET /get':
                    await route.fulfill({ status: 200, headers: corsHeaders(), json: this.store.getResponse(url.searchParams.get('id') || callerId) });
                    return;
                case 'POST /create':
                    this.store.create(callerId, body);
                    await route.fulfill({ status: 201, headers: corsHeaders() });
                    return;
                case 'PUT /update':
                    this.store.update(body);
                    await route.fulfill({ status: 200, headers: corsHeaders() });
                    return;
                case 'POST /delete':
                    this.store.delete(body);
                    await route.fulfill({ status: 200, headers: corsHeaders() });
                    return;
                case 'GET /pdf':
                    await route.fulfill({
                        status: 303,
                        headers: { ...corsHeaders(), location: `${this.presignedUrlOrigin}/${SURNAME}FamilyDirectory?X-Amz-Signature=e2e` },
                    });
                    return;
                default:
                    this.unexpectedRequests.push(`${method} ${request.url()}`);
                    await route.fulfill({ status: 404, headers: corsHeaders() });
            }
        } catch (error) {
            if (error instanceof NotFound) {
                await route.fulfill({ status: 404, headers: corsHeaders() });
                return;
            }
            throw error;
        }
    }
}

function corsHeaders(): Record<string, string> {
    return { 'access-control-allow-origin': APP_ORIGIN, vary: 'Origin' };
}

function preflightHeaders(request: Request): Record<string, string> {
    return {
        ...corsHeaders(),
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': request.headers()['access-control-request-headers'] ?? '*',
        'access-control-max-age': '0',
    };
}

function unsignedJwt(payload: Record<string, unknown>): string {
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    return `${encode({ alg: 'RS256', kid: 'e2e', typ: 'JWT' })}.${encode(payload)}.${Buffer.from('e2e').toString('base64url')}`;
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
}
