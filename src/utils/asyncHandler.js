// const asyncHandler = (fn) => {async () => {}}

const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler()).reject ((err) => next(err))
    }
}

// const asyncHandler = (fn) => async (req,res, next) => {
//     try {
//         aait fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

export {asyncHandler}