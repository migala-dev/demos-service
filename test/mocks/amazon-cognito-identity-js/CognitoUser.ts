import { loginConstants } from "../constants/constants";

function CognitoUser(data) {
  const { Username } = data;
  const originalSession = loginConstants.sessionMockToken;
  this.username = Username;
  this.Session = originalSession;
  this.setAuthenticationFlowType = jest.fn().mockReturnValue('auth');
  this.initiateAuth = jest.fn((authDetails, callbacks) => {
    const userNotExist = this.username === loginConstants.phoneNumberNotCreated;
    if (!userNotExist) {
      callbacks.customChallenge({ USERNAME: loginConstants.cognitoMockId });
    } else {
      callbacks.onFailure({ message: 'User does not exist' });
    } 
  });
  this.sendCustomChallengeAnswer = jest.fn((answerChallenge, callbacks) => {
    if (originalSession !== this.Session) {
      callbacks.onFailure({ message: 'Not a valid session' });
    } else {
      const tokenObject = {
        getAccessToken: () => ({
          getJwtToken: () => 'jwt-token-mock',
        }),
        getRefreshToken: () => ({
          getToken: () => 'refresh-token-mock',
        }),
      };
      callbacks.onSuccess(tokenObject);
    }
  });
}

module.exports = CognitoUser;
