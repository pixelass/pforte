export default function githubProvider(config: any): {
    url: string;
    name: string;
    connect({ request }: {
        request: any;
    }): Promise<{
        user: any;
        accessToken: any;
    }>;
};

//# sourceMappingURL=types.d.ts.map
