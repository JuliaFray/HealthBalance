import {body} from 'express-validator';

export const loginValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть не менее 5 и не более 20 символов').isLength({min: 5, max: 20})
];

export const registerValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть не менее 5 и не более 20  символов').isLength({min: 5, max: 20}),
    body('firstName', 'Имя должно быть не более 20 символов').isLength({max: 20}),
    body('secondName', 'Фамилия должна быть не более 20 символов').isLength({max: 20}),
];

export const postCreateValidation = [
    body('title', 'Введите заголовок статьи').isLength({min: 3}).isString(),
    body('text', 'Введите текст статьи').isLength({min: 10}).isString(),
    body('tags', 'Неверный формат тэгов (укажите массив)').optional().isArray(),
    body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
];
