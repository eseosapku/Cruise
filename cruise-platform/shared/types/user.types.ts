export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile {
    userId: string;
    firstName: string;
    lastName: string;
    bio?: string;
    profilePictureUrl?: string;
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
    };
}

export interface UserCredentials {
    email: string;
    password: string;
}