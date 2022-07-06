export function setCookie(response: any, cookie: any): void;
export function extendHandler({ request, response, maxAge }: {
    request: any;
    response: any;
    maxAge: any;
}): {
    sessionToken: string;
    csrfToken: {
        csrfTokenVerified: boolean;
        csrfToken: string;
        cookie?: undefined;
    } | {
        cookie: string;
        csrfToken: string;
        csrfTokenVerified?: undefined;
    };
    expires: Date;
};
export function handleSession({ request }: {
    request: any;
}, adapter: any): Promise<any>;
export function handleSignOut({ response }: {
    response: any;
}): void;
export default function pforte({ adapter, providers, maxAge }: {
    adapter: any;
    providers: any;
    maxAge?: number;
}): (request: any, response: any) => Promise<void>;

//# sourceMappingURL=types.d.ts.map
