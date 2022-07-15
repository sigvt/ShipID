# ShipID Verification Strategy

1. Live chat presense
2. Membership joining message presense (Work in progress)
3. Milestone message presense (Work in progress)
4. Comment presense (Work in progress)

We suppose having `LIFETIME` variable with `1 week`.
If user's last verification date is older than `LIFETIME` or never been verified before, verification process will commence.

## Verification

- Search live chats posted by the user within `LIFETIME` time range
  - If one of the chats has a valid membership badge, the user will be verified.
  - Otherwise, go to the next step
- Search membership joining message or milestone message of the user within `LIFETIME` time range
  - If one of them exists, the user will be verified
  - Otherwise, go to the next step
- Ask the user to provide the permalink of the video comment the user has posted on the video
  - If the comment has a valid membership badge, the user will be verified
  - After 24 hours without a response, go to the next step
- Retry livechat strats once again
  - If verification is successful, the process is complete
  - Otherwise, go to the next step
- Delete members-only role from the user

