import { User } from "./user";

export class UserParams {
    gender: string;
    minAge = 18;
    maxAge = 150;
    pageNumber = 1;
    pageSize = 6;
    orderBy = 'lastActive';

    constructor(user: User) {
        (user.gender === 'female')
            ? this.gender = 'male'
            : this.gender = 'female';
    }

}