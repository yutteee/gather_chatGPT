"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDecoder = exports.generateEncoder = void 0;
const ts_poet_1 = require("ts-poet");
const types_1 = require("./types");
const options_1 = require("./options");
function generateEncoder(ctx, typeName) {
    const name = types_1.wrapperTypeName(typeName);
    if (!name) {
        return ts_poet_1.code `${types_1.messageToTypeName(ctx, typeName)}.encode(value).finish()`;
    }
    if (name == 'Timestamp') {
        const TimestampValue = ts_poet_1.imp(`${name}@./google/protobuf/timestamp`);
        return ts_poet_1.code `${TimestampValue}.encode(${ctx.utils.toTimestamp}(value)).finish()`;
    }
    const TypeValue = ts_poet_1.imp(`${name}@./google/protobuf/wrappers`);
    switch (name) {
        case 'StringValue':
            return ts_poet_1.code `${TypeValue}.encode({value: value ?? ""}).finish()`;
        case 'Int32Value':
        case 'UInt32Value':
        case 'DoubleValue':
        case 'FloatValue':
            return ts_poet_1.code `${TypeValue}.encode({value: value ?? 0}).finish()`;
        case 'Int64Value':
        case 'UInt64Value':
            if (ctx.options.forceLong === options_1.LongOption.LONG) {
                return ts_poet_1.code `${TypeValue}.encode({value: value ? value.toNumber(): 0}).finish()`;
            }
            return ts_poet_1.code `${TypeValue}.encode({value: value ?? 0 }).finish()`;
        case 'BoolValue':
            return ts_poet_1.code `${TypeValue}.encode({value: value ?? false}).finish()`;
        case 'BytesValue':
            return ts_poet_1.code `${TypeValue}.encode({value: value ?? new Uint8Array()}).finish()`;
    }
    throw new Error(`unknown wrapper type: ${name}`);
}
exports.generateEncoder = generateEncoder;
function generateDecoder(ctx, typeName) {
    let name = types_1.wrapperTypeName(typeName);
    if (!name) {
        return ts_poet_1.code `${types_1.messageToTypeName(ctx, typeName)}.decode(value)`;
    }
    let TypeValue;
    if (name == 'Timestamp') {
        TypeValue = ts_poet_1.imp(`${name}@./google/protobuf/timestamp`);
        return ts_poet_1.code `${TypeValue}.decode(value)`;
    }
    TypeValue = ts_poet_1.imp(`${name}@./google/protobuf/wrappers`);
    return ts_poet_1.code `${TypeValue}.decode(value).value`;
}
exports.generateDecoder = generateDecoder;
