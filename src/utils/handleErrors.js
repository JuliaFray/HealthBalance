const castErrorHandler = (err) => {
    const msg = `Неверное значение для ${err.path}: ${err.value}!`
    return {isOperational: true, message: msg};
}

const validationErrorHandler = (err) => {
    const errors = Object.values(err.errors).map(val => val.message);
    const errorMessages = errors.join('. ');
    const msg = `Неверные значения: ${errorMessages}`;

    return {isOperational: true, message: msg};
}

const duplicateKeyErrorHandler = (err) => {
    const errors = Object.keys(err.keyValue)
        .map(field => ({field, msg: `Значение должно быть уникально`}))
    return {type: 'validation', errors};
}

const prodErrors = (res, error) => {
    if (error.isOperational) {
        res.status(400).json({
            resultCode: 1,
            message: error.message
        });
    }
    if (error.type === 'validation') {
        res.status(400).json({
            resultCode: 2,
            message: '',
            data: error.errors
        });
    } else {
        res.status(500).json({
            resultCode: 1,
            message: 'Неизвестная ошибка.'
        })
    }
}

export default (error, req, res, next) => {
    console.log(error)
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (error.name === 'CastError') {
        error = castErrorHandler(error);
    }
    if (error.code === 11000) {
        error = duplicateKeyErrorHandler(error);
    }
    if (error.name === 'ValidationError') {
        error = validationErrorHandler(error);
    }
    prodErrors(res, error);
}

