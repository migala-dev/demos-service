import { Tokens } from './tokens.model';

export class UserVerified {
  session: string;
  tokens: Tokens;
  bucketName: string;

  static withSession(session: string): UserVerified {
    const userVerified = new UserVerified();
    userVerified.session = session;
    return userVerified;
  }
}
