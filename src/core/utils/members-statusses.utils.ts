import { InvitationStatus } from "../enums";

export class MemberStatussesUtil {
    public static getActiveStatusses(): InvitationStatus[] {
        return [InvitationStatus.ACCEPTED, InvitationStatus.RECEIVED, InvitationStatus.SENDED];
    }
}
