const args = [
    { name: "cicdProfile", mandatory: true },
    { name: "coreProfile", mandatory: true },
    { name: "env", mandatory: true },
    { name: "bucket", mandatory: true },
    { name: "artifact", mandatory: true },
    { name: "fullImport", mandatory: false },
    { name: "local", mandatory: false },
];

const options = {
    options: {
        cicdProfile: {
            type: "string", default: undefined
        },
        coreProfile: {
            type: "string", default: undefined
        },
        env: {
            type: "string", default: undefined
        },
        artifact: {
            type: "string", default: undefined
        },
        bucket: {
            type: "string", default: undefined
        },
        fullImport: {
            type: "boolean", default: false
        },
        local: {
            type: "boolean", default: false
        }
    }
};

const envAllowedValues = [
    'dev',
    'test',
    'uat',
    'hotfix',
    'prod'
]

module.exports = {
    templateArgs: args,
    templateOptions: options,
    templateEnv: envAllowedValues,
}