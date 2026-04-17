export type UserRole = 'Tenant' | 'Landlord';

export type UserType = {
    id: string;
    isEmailVerified: boolean;
    email: string;
    password: string;
    phoneNumber: string;
    invitationCode?: string;
    role: UserRole;
};
