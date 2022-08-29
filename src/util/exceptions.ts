export class RequestError extends Error {
    public statusCode: number;

    constructor(message: string, code: number) {
        super(message);
        this.statusCode = code;
    }
}
