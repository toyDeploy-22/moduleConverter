

function findError(error) {
    let result = new Object;
    switch (error.status) {
        case 400: 
        result.code = 400;
        result.err = true;
        result.msg = error.message;
        break; 
        
        case 401:  
        result.code = 401;
        result.err = true;
        result.msg = error.message;
        break;

        case 404:
        result.code = 404;
        result.err = true;
        result.msg = error.message;
        break; 

        default:
        result.code = 500;
        result.err = true;
        result.msg = error.message;
    }
    return result;
}

const sendError=(err, req, res, next) => {
    if(err) {
const errorStack = findError(err);
res.status(err.status || errorStack.code).send(errorStack.msg || "Something went wrong.")
    };
    next();
}

export default sendError;