export interface JwtPayload {
    sub: string;
    role: string;
    nodeId: string | null;
}
