const { fromSSO } = require("@aws-sdk/credential-provider-sso");

class AwsAuthClient {

    /**
     * Return valid AWS credentials using sso profile to perform authentication
     *
     * @param profile   profile to use during authentication
     *
     * @return AWS temporary credentials
     * */
    async ssoCredentials(profile) {
        return fromSSO({ profile: profile })();
    }
}

exports.AwsAuthClient = AwsAuthClient;