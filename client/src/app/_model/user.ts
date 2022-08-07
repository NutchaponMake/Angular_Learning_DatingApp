export interface LoginRes {
    status: string;
    message: string;
    data: User;
}

export interface RegisterRes {
    status: string;
    message: string;
    data: User;
}

export interface User {
    username: string;
    token: string;
}