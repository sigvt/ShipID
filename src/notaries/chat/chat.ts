import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import { Membership } from "masterchat";

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Chat {
  @prop({ required: true, unique: true })
  public id!: string;

  @prop({ required: true })
  public message!: string;

  @prop({ allowMixed: Severity.ALLOW })
  public membership?: Membership;

  @prop({ required: true })
  public authorChannelId!: string;

  @prop({ required: true })
  public authorPhoto!: string;

  @prop({ required: true })
  public isVerified!: Boolean;

  @prop({ required: true })
  public isOwner!: Boolean;

  @prop({ required: true })
  public isModerator!: Boolean;

  @prop({ required: true })
  public originVideoId!: string;

  @prop({ required: true })
  public originChannelId!: string;

  @prop({ required: true, index: true })
  public timestamp!: Date;
}
