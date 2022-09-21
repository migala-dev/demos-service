import { loginConstants } from "../constants/constants";

function CognitoUserPool(data) {
  const { UserPoolId, ClientId } = data;
  this.userPoolId = UserPoolId;
  this.clientId = ClientId;
  this.signUp = jest.fn((_phoneNumber, _password, _attributeList, _x, callback) => {
    callback(null, { userSub: loginConstants.cognitoMockId });
  });
}

module.exports = CognitoUserPool;
