import "dotenv/config";
const { SENDINBLUE_API_KEY } = process.env;

var SibApiV3Sdk = require("sib-api-v3-sdk");

var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = SENDINBLUE_API_KEY;

var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

interface ISendEmail {
  email: string;
  name?: string;
}

export const SendEmail = async ({ email, name }: ISendEmail) => {
  sendSmtpEmail = {
    to: [{ email, name }],
    templateId: 59,
    params: {
      name,
    },
    headers: {
      "X-Mailin-custom": "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
    },
  };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log({ data });
  } catch (error) {
    console.error(error);
  }
};
