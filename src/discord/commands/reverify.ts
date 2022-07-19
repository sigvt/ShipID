import { SlashCommandBuilder } from "@discordjs/builders";
import { debugLog } from "../../util";
import { Command, RoleChangeset } from "../interfaces";
import { applyRoleChangesState } from "../states/applyRoles";
import { notifyState } from "../states/notify";
import { onboardState } from "../states/onboard";
import { verifyWithChatState } from "../states/verifyWithChat";
import { verifyWithCommentState } from "../states/verifyWithComment";

export enum State {
  START,
  END,
  ERROR,
  ONBOARD,
  VERIFY_WITH_CHAT,
  VERIFY_WITH_COMMENT,
  REGISTER_COMMENT_ID,
  APPLY_ROLE_CHANGES,
  NOTIFY,
}

export interface StateContext {
  rolesToChange?: RoleChangeset[];
  error?: string;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("reverify")
    .setDescription("Force verify membership status"),

  async execute(intr, { hb }) {
    debugLog("reverify:", intr.user.username);

    const initialState = State.VERIFY_WITH_CHAT;

    let currentState: State = initialState;
    let context: StateContext = {};

    while (currentState !== State.END) {
      let next!: [State, StateContext];
      switch (currentState) {
        case State.VERIFY_WITH_CHAT:
          next = await verifyWithChatState(intr, context);
          break;
        case State.VERIFY_WITH_COMMENT:
          next = await verifyWithCommentState(intr, context);
          break;
        case State.ONBOARD:
          next = await onboardState(intr, context);
          break;
        case State.APPLY_ROLE_CHANGES:
          next = await applyRoleChangesState(intr, context);
          break;
        case State.NOTIFY:
          next = await notifyState(intr, context);
          break;
        default:
          throw new Error(`Unrecognized state: ${currentState}`);
      }
      currentState = next[0];
      context = { ...context, ...next[1] };
    }
  },
};

export default command;
