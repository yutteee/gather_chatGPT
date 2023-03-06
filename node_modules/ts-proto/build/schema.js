"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSchema = void 0;
const ts_poet_1 = require("ts-poet");
const visit_1 = require("./visit");
const utils_1 = require("./utils");
const fileDescriptorProto = ts_poet_1.imp('FileDescriptorProto@ts-proto-descriptors');
function generateSchema(ctx, fileDesc, sourceInfo) {
    var _a;
    const { options } = ctx;
    const chunks = [];
    chunks.push(ts_poet_1.code `
    export interface ProtoMetadata {
      fileDescriptor: ${fileDescriptorProto};
      references: { [key: string]: any };
      dependencies?: ProtoMetadata[];
    }
  `);
    const references = [];
    function addReference(localName, symbol) {
        references.push(ts_poet_1.code `'.${utils_1.maybePrefixPackage(fileDesc, localName.replace(/_/g, '.'))}': ${symbol}`);
    }
    visit_1.visit(fileDesc, sourceInfo, (fullName) => {
        if (options.outputEncodeMethods) {
            addReference(fullName, fullName);
        }
    }, options, (fullName) => {
        addReference(fullName, fullName);
    });
    visit_1.visitServices(fileDesc, sourceInfo, (serviceDesc) => {
        if (options.outputClientImpl) {
            addReference(serviceDesc.name, `${serviceDesc.name}ClientImpl`);
        }
    });
    const dependencies = fileDesc.dependency.map((dep) => {
        return ts_poet_1.code `${ts_poet_1.imp(`protoMetadata@./${dep.replace('.proto', '')}`)}`;
    });
    // Use toObject so that we get enums as numbers (instead of the default toJSON behavior)
    const descriptor = { ...fileDesc };
    // Only keep locations that include comments
    descriptor.sourceCodeInfo = {
        location: ((_a = descriptor.sourceCodeInfo) === null || _a === void 0 ? void 0 : _a.location.filter((loc) => loc['leadingComments'] || loc['trailingComments'])) || [],
    };
    chunks.push(ts_poet_1.code `
    export const ${ts_poet_1.def('protoMetadata')}: ProtoMetadata = {
      fileDescriptor: ${fileDescriptorProto}.fromPartial(${descriptor}),
      references: { ${ts_poet_1.joinCode(references, { on: ',' })} },
      dependencies: [${ts_poet_1.joinCode(dependencies, { on: ',' })}],
    }
  `);
    return chunks;
}
exports.generateSchema = generateSchema;
