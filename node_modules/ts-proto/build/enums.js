"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEnumToNumber = exports.generateEnumToJson = exports.generateEnumFromJson = exports.generateEnum = void 0;
const ts_poet_1 = require("ts-poet");
const utils_1 = require("./utils");
const case_1 = require("./case");
const sourceInfo_1 = require("./sourceInfo");
const UNRECOGNIZED_ENUM_NAME = 'UNRECOGNIZED';
const UNRECOGNIZED_ENUM_VALUE = -1;
// Output the `enum { Foo, A = 0, B = 1 }`
function generateEnum(ctx, fullName, enumDesc, sourceInfo) {
    var _a;
    const { options } = ctx;
    const chunks = [];
    utils_1.maybeAddComment(sourceInfo, chunks, (_a = enumDesc.options) === null || _a === void 0 ? void 0 : _a.deprecated);
    chunks.push(ts_poet_1.code `export ${options.constEnums ? 'const ' : ''}enum ${ts_poet_1.def(fullName)} {`);
    enumDesc.value.forEach((valueDesc, index) => {
        var _a;
        const info = sourceInfo.lookup(sourceInfo_1.Fields.enum.value, index);
        utils_1.maybeAddComment(info, chunks, (_a = valueDesc.options) === null || _a === void 0 ? void 0 : _a.deprecated, `${valueDesc.name} - `);
        chunks.push(ts_poet_1.code `${valueDesc.name} = ${options.stringEnums ? `"${valueDesc.name}"` : valueDesc.number.toString()},`);
    });
    if (options.unrecognizedEnum)
        chunks.push(ts_poet_1.code `
      ${UNRECOGNIZED_ENUM_NAME} = ${options.stringEnums ? `"${UNRECOGNIZED_ENUM_NAME}"` : UNRECOGNIZED_ENUM_VALUE.toString()},`);
    chunks.push(ts_poet_1.code `}`);
    if (options.outputJsonMethods || (options.stringEnums && options.outputEncodeMethods)) {
        chunks.push(ts_poet_1.code `\n`);
        chunks.push(generateEnumFromJson(ctx, fullName, enumDesc));
    }
    if (options.outputJsonMethods) {
        chunks.push(ts_poet_1.code `\n`);
        chunks.push(generateEnumToJson(fullName, enumDesc));
    }
    if (options.stringEnums && options.outputEncodeMethods) {
        chunks.push(ts_poet_1.code `\n`);
        chunks.push(generateEnumToNumber(fullName, enumDesc));
    }
    return ts_poet_1.joinCode(chunks, { on: '\n' });
}
exports.generateEnum = generateEnum;
/** Generates a function with a big switch statement to decode JSON -> our enum. */
function generateEnumFromJson(ctx, fullName, enumDesc) {
    const { options, utils } = ctx;
    const chunks = [];
    const functionName = case_1.camelCase(fullName) + 'FromJSON';
    chunks.push(ts_poet_1.code `export function ${ts_poet_1.def(functionName)}(object: any): ${fullName} {`);
    chunks.push(ts_poet_1.code `switch (object) {`);
    for (const valueDesc of enumDesc.value) {
        chunks.push(ts_poet_1.code `
      case ${valueDesc.number}:
      case "${valueDesc.name}":
        return ${fullName}.${valueDesc.name};
    `);
    }
    if (options.unrecognizedEnum) {
        chunks.push(ts_poet_1.code `
      case ${UNRECOGNIZED_ENUM_VALUE}:
      case "${UNRECOGNIZED_ENUM_NAME}":
      default:
        return ${fullName}.${UNRECOGNIZED_ENUM_NAME};
    `);
    }
    else {
        // We use globalThis to avoid conflicts on protobuf types named `Error`.
        chunks.push(ts_poet_1.code `
      default:
        throw new ${utils.globalThis}.Error("Unrecognized enum value " + object + " for enum ${fullName}");
    `);
    }
    chunks.push(ts_poet_1.code `}`);
    chunks.push(ts_poet_1.code `}`);
    return ts_poet_1.joinCode(chunks, { on: '\n' });
}
exports.generateEnumFromJson = generateEnumFromJson;
/** Generates a function with a big switch statement to encode our enum -> JSON. */
function generateEnumToJson(fullName, enumDesc) {
    const chunks = [];
    const functionName = case_1.camelCase(fullName) + 'ToJSON';
    chunks.push(ts_poet_1.code `export function ${ts_poet_1.def(functionName)}(object: ${fullName}): string {`);
    chunks.push(ts_poet_1.code `switch (object) {`);
    for (const valueDesc of enumDesc.value) {
        chunks.push(ts_poet_1.code `case ${fullName}.${valueDesc.name}: return "${valueDesc.name}";`);
    }
    chunks.push(ts_poet_1.code `default: return "UNKNOWN";`);
    chunks.push(ts_poet_1.code `}`);
    chunks.push(ts_poet_1.code `}`);
    return ts_poet_1.joinCode(chunks, { on: '\n' });
}
exports.generateEnumToJson = generateEnumToJson;
/** Generates a function with a big switch statement to encode our string enum -> int value. */
function generateEnumToNumber(fullName, enumDesc) {
    const chunks = [];
    const functionName = case_1.camelCase(fullName) + 'ToNumber';
    chunks.push(ts_poet_1.code `export function ${ts_poet_1.def(functionName)}(object: ${fullName}): number {`);
    chunks.push(ts_poet_1.code `switch (object) {`);
    for (const valueDesc of enumDesc.value) {
        chunks.push(ts_poet_1.code `case ${fullName}.${valueDesc.name}: return ${valueDesc.number};`);
    }
    chunks.push(ts_poet_1.code `default: return 0;`);
    chunks.push(ts_poet_1.code `}`);
    chunks.push(ts_poet_1.code `}`);
    return ts_poet_1.joinCode(chunks, { on: '\n' });
}
exports.generateEnumToNumber = generateEnumToNumber;
