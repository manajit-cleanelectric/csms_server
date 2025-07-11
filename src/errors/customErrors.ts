class ResourceNotFoundError extends Error {
    constructor(message: string = "Resource not found") {
        super(message);
        this.name = "ResourceNotFoundError";
        Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
    }
}

class ResourceAlreadyExistsError extends Error {
    constructor(message: string = "Resource already exists") {
        super(message);
        this.name = "ResourceAlreadyExistsError";
        Object.setPrototypeOf(this, ResourceAlreadyExistsError.prototype);
    }
}

class MissingParameterError extends Error {
    constructor(message: string = "Missing required parameter") {
        super(message);
        this.name = "MissingParameterError";
        Object.setPrototypeOf(this, MissingParameterError.prototype);
    }
}

class InvalidUUIDError extends Error {
    constructor(message: string = "Invalid UUID format") {
        super(message);
        this.name = "InvalidUUIDError";
        Object.setPrototypeOf(this, InvalidUUIDError.prototype);
    }
}

class NoContentError extends Error {
    constructor(message: string = "No content available") {
        super(message);
        this.name = "NoContentError";
        Object.setPrototypeOf(this, NoContentError.prototype);
    }
}

function handleError(error: any, res: any, logger: any) {
    switch (error.name) {
        case 'ResourceNotFoundError':
            res.status(404).send({success: false, error: error.message, data: null});
            logger.error(`Resource not found: ${error.message}`);
            break;
        case 'ResourceAlreadyExistsError':
            res.status(409).send({success: false, error: error.message, data: null});
            logger.error(`Resource already exists: ${error.message}`);
            break;
        case 'MissingParameterError':
            res.status(400).send({success: false, error: error.message, data: null});
            logger.error(`Missing parameter: ${error.message}`);
            break;
        case 'InvalidUUIDError':
            res.status(400).send({success: false, error: error.message, data: null});
            logger.error(`Invalid UUID: ${error.message}`);
            break;
        case 'NoContentError':
            res.status(204).send({success: true, message: error.message, data: null});
            logger.info(`No content available: ${error.message}`);
            break;
        default:
            res.status(500).send({success: false, error: "An unexpected error occurred", data: null});
            logger.error(`Unexpected error: ${error.message}`);
            break;
    }
}

export {
    ResourceNotFoundError,
    ResourceAlreadyExistsError,
    MissingParameterError,
    InvalidUUIDError,
    NoContentError,
    handleError,
}