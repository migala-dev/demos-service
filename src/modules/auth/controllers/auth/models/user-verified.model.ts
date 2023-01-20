import { User } from '../../../../../core/database/entities/user.entity';
import { Tokens } from './tokens.model';

export class UserVerified {
  session: string;
  tokens: Tokens;
  bucketName: string;
  user: User;

  public get isVerifed(): boolean {
    return !!this.tokens;
  }

  constructor(tokens?: Tokens, bucketName?: string) {
    this.tokens = tokens;
    this.bucketName = bucketName;
  }

  static withSession(session: string): UserVerified {
    const userVerified = new UserVerified();
    userVerified.session = session;
    return userVerified;
  }
}
