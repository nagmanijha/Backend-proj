class ApiError extends Error {
    constructor(
        message="Something went wrong",
        errors=[],
        stack="",
        statusCode = 500
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors=errors

        if(stack) {
            this.stack= stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}