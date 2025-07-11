class UserNotFoundError extends Error {
    constructor(message: string = "User not found") {
        super(message);
        this.name = "UserNotFoundError";
        Object.setPrototypeOf(this, UserNotFoundError.prototype);
    }
}

class UserAlreadyExistsError extends Error {
    constructor(message: string = "User already exists") {
        super(message);
        this.name = "UserAlreadyExistsError";
        Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
    }
}

class UserUnauthorizedError extends Error {
    constructor(message: string = "User is not authorized") {
        super(message);
        this.name = "UserUnauthorizedError";
        Object.setPrototypeOf(this, UserUnauthorizedError.prototype);
    }
}

export {
    UserNotFoundError,
    UserAlreadyExistsError,
    UserUnauthorizedError
}