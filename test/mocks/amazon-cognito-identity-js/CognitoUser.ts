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
    } else if(loginConstants.correctVerificationCode === answerChallenge) {
      const tokenObject = {
        getAccessToken: () => ({
          getJwtToken: () => loginConstants.accessTokenMock,
        }),
        getRefreshToken: () => ({
          getToken: () => loginConstants.refreshTokenMock,
        }),
      };
      callbacks.onSuccess(tokenObject);
    } else {
      this.Session = loginConstants.secondSessionMockToken;
      callbacks.customChallenge();
    }
  });

  this.refreshSession = jest.fn((refreshSession, callback: (err: any, session: any ) => void) => {
    console.log(refreshSession);
    if (refreshSession.refreshToken === loginConstants.refreshTokenMock) {
      const tokenObject = {
        getAccessToken: () => ({
          getJwtToken: () => loginConstants.accessTokenMock,
        }),
        getRefreshToken: () => ({
          getToken: () => loginConstants.newRefreshTokenMock,
        }),
      };
      callback(null, tokenObject);
    } else {
      const err = { message: 'Invalid Refresh Token' };
      callback(err, null);
    }
  });
}

module.exports = CognitoUser;
