// TODO: type the user
export type User = any;

export interface SignInParams {
    email: string;
    password: string;
}

export interface SignInResponse {
    message: string;
    user: {
        fullname: string;
        access_token: string;
    };
}

export interface SignUpParams {
    name: string;
    lastname?: string;
    email: string;
    password: string;
}

export interface SignUpResponse {
    message: string;
    user: {
        fullname: string;
        email: string;
    };
}

export interface ForgotPasswordParams {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
}

export interface ResetPasswordParams {
    password: string;
    token: string;
}

export interface ResetPasswordResponse {
    message: string;
}
