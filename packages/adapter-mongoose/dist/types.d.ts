export default function mongooseAdapter(connect: any): (type: any, payload: any) => Promise<{
    user: {
        id: any;
        name: any;
        email: any;
        image: any;
    };
} | {
    id: any;
    name: any;
    email: any;
    image: any;
}>;

//# sourceMappingURL=types.d.ts.map
