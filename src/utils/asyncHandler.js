//higher order function:- accept, return function
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }

// const asyncHandler = () => {} //callback function
// const asyncHandler = (func) => {} //callback function with func as argument
// const asyncHandler = (func) => {() => {}} //callback function return function while taking function as argument

// const asyncHandler = (func) => async (req, res, next) => {
//     try{
//         await func(req, res, next)
//     } catch (error) {
//        res.status(error.code || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error"
//        })
//     }
// }

