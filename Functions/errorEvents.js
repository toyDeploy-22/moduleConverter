

function findError(error) {
    let result = new Object;
    switch (error.code.toString()) {
        case "400":
        case "401":
        case "404": 
        result.code = error.code;
        result.err = true;
        result.msg = error.msg;
        break; 

        default:
        result.code = 500;
        result.err = true;
        result.msg = error.msg;
    }
    return result;
}

const sendError=(err, req, res, next) => {
    if(err) {
const errorStack = findError(err);
res.status(errorStack.code).send(errorStack.msg || "Something went wrong.")
    };
    next();
}

export default sendError;