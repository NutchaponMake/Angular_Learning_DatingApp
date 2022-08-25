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
    userName: string;
    token: string;
    photoUrl: string;
    knownAs:string;
    gender:string;
}