"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTsPoetOpts = exports.optionsFromParameter = exports.defaultOptions = exports.ServiceOption = exports.OneofOption = exports.EnvOption = exports.DateOption = exports.LongOption = void 0;
var LongOption;
(function (LongOption) {
    LongOption["NUMBER"] = "number";
    LongOption["LONG"] = "long";
    LongOption["STRING"] = "string";
})(LongOption = exports.LongOption || (exports.LongOption = {}));
var DateOption;
(function (DateOption) {
    DateOption["DATE"] = "date";
    DateOption["STRING"] = "string";
    DateOption["TIMESTAMP"] = "timestamp";
})(DateOption = exports.DateOption || (exports.DateOption = {}));
var EnvOption;
(function (EnvOption) {
    EnvOption["NODE"] = "node";
    EnvOption["BROWSER"] = "browser";
    EnvOption["BOTH"] = "both";
})(EnvOption = exports.EnvOption || (exports.EnvOption = {}));
var OneofOption;
(function (OneofOption) {
    OneofOption["PROPERTIES"] = "properties";
    OneofOption["UNIONS"] = "unions";
})(OneofOption = exports.OneofOption || (exports.OneofOption = {}));
var ServiceOption;
(function (ServiceOption) {
    ServiceOption["GRPC"] = "grpc-js";
    ServiceOption["GENERIC"] = "generic-definitions";
    ServiceOption["DEFAULT"] = "default";
    ServiceOption["NONE"] = "none";
})(ServiceOption = exports.ServiceOption || (exports.ServiceOption = {}));
function defaultOptions() {
    return {
        context: false,
        snakeToCamel: true,
        forceLong: LongOption.NUMBER,
        useOptionals: false,
        useDate: DateOption.DATE,
        oneof: OneofOption.PROPERTIES,
        esModuleInterop: false,
        lowerCaseServiceMethods: false,
        outputEncodeMethods: true,
        outputJsonMethods: true,
        outputPartialMethods: true,
        outputTypeRegistry: false,
        stringEnums: false,
        constEnums: false,
        outputClientImpl: true,
        outputServices: ServiceOption.DEFAULT,
        returnObservable: false,
        addGrpcMetadata: false,
        addNestjsRestParameter: false,
        nestJs: false,
        env: EnvOption.BOTH,
        unrecognizedEnum: true,
        exportCommonSymbols: true,
        outputSchema: false,
        onlyTypes: false,
        emitImportedFiles: true,
    };
}
exports.defaultOptions = defaultOptions;
const nestJsOptions = {
    lowerCaseServiceMethods: true,
    outputEncodeMethods: false,
    outputJsonMethods: false,
    outputPartialMethods: false,
    outputClientImpl: false,
    useDate: DateOption.TIMESTAMP,
};
function optionsFromParameter(parameter) {
    const options = defaultOptions();
    if (parameter) {
        const parsed = parseParameter(parameter);
        if (parsed.nestJs) {
            Object.assign(options, nestJsOptions);
        }
        Object.assign(options, parsed);
    }
    // We should promote onlyTypes to its own documented flag, but just an alias for now
    if (!options.outputJsonMethods && !options.outputEncodeMethods && !options.outputClientImpl && !options.nestJs) {
        options.onlyTypes = true;
    }
    // Treat forceLong=true as LONG
    if (options.forceLong === true) {
        options.forceLong = LongOption.LONG;
    }
    // Treat outputServices=false as NONE
    if (options.outputServices === false) {
        options.outputServices = ServiceOption.NONE;
    }
    if (options.useDate === true) {
        // Treat useDate=true as DATE
        options.useDate = DateOption.DATE;
    }
    else if (options.useDate === false) {
        // Treat useDate=false as TIMESTAMP
        options.useDate = DateOption.TIMESTAMP;
    }
    return options;
}
exports.optionsFromParameter = optionsFromParameter;
// A very naive parse function, eventually could/should use iots/runtypes
function parseParameter(parameter) {
    const options = {};
    const pairs = parameter.split(',').map((s) => s.split('='));
    pairs.forEach(([key, value]) => {
        options[key] = value === 'true' ? true : value === 'false' ? false : value;
    });
    return options;
}
function getTsPoetOpts(options) {
    if (options.esModuleInterop) {
        return { forceDefaultImport: ['protobufjs/minimal'] };
    }
    else {
        return {};
    }
}
exports.getTsPoetOpts = getTsPoetOpts;
