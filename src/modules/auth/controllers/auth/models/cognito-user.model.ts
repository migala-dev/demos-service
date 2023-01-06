export class CognitoUser {
  public readonly session: string;
  public readonly cognitoId: string;
  public readonly isUserCreated: boolean = true;

  constructor(session: string, cognitoId: string) {
    this.session = session;
    this.cognitoId = cognitoId;
    this.isUserCreated = !!cognitoId;
  }

  public static notCreated(): CognitoUser {
    const cognitoUser = new CognitoUser(null, null);
    return cognitoUser;
  }
}
