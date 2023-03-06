"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelCase = exports.capitalize = exports.camelToSnake = exports.maybeSnakeToCamel = void 0;
function maybeSnakeToCamel(s, options) {
    if (options.snakeToCamel && s.includes('_')) {
        return s
            .split('_')
            .map((word, i) => {
            if (i === 0) {
                // if first symbol is "_" then skip it
                return word ? word[0] + word.substring(1).toLowerCase() : '';
            }
            else {
                return capitalize(word.toLowerCase());
            }
        })
            .join('');
    }
    else {
        return s;
    }
}
exports.maybeSnakeToCamel = maybeSnakeToCamel;
function camelToSnake(s) {
    return s
        .replace(/[\w]([A-Z])/g, function (m) {
        return m[0] + '_' + m[1];
    })
        .toUpperCase();
}
exports.camelToSnake = camelToSnake;
function capitalize(s) {
    return s.substring(0, 1).toUpperCase() + s.substring(1);
}
exports.capitalize = capitalize;
function camelCase(s) {
    return s.substring(0, 1).toLowerCase() + s.substring(1);
}
exports.camelCase = camelCase;
