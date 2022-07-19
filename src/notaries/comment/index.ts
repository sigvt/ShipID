import { Masterchat } from "masterchat";
import { debugLog } from "../../util";

export async function getMembershipStatusFromComment(
  videoId: string,
  commentId: string
) {
  const mc = new Masterchat(videoId, "");
  const comment = await mc.getComment(commentId);
  const rdr =
    comment?.comment.commentRenderer.sponsorCommentBadge
      ?.sponsorCommentBadgeRenderer;
  debugLog(rdr);
  return rdr;
}
