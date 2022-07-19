import { Honeybee } from ".";

const HONEYBEE_URI = process.env.HONEYBEE_URI;
const HB_TEST_CHANNEL_ID = process.env.HB_TEST_CHANNEL_ID;
const HB_TEST_CHANNEL_ID_NE = process.env.HB_TEST_CHANNEL_ID_NE;
const HB_TEST_ORIGIN_CHANNEL_ID = process.env.HB_TEST_ORIGIN_CHANNEL_ID;

let hb!: Honeybee;

beforeAll(() => {
  console.time("hb");
  hb = new Honeybee(HONEYBEE_URI!);
  console.timeEnd("hb");
});

afterAll(async () => {
  await hb.close();
});

it("can fetch membership", async () => {
  console.time("getChat");
  const membership = await hb.getMembershipStatus({
    authorChannelId: HB_TEST_CHANNEL_ID!,
    originChannelId: HB_TEST_ORIGIN_CHANNEL_ID!,
  });
  console.timeEnd("getChat");

  expect(membership).toEqual(
    expect.objectContaining({
      status: expect.any(String),
    })
  );
});

it("should returns undefined", async () => {
  console.time("getChat");
  const membership = await hb.getMembershipStatus({
    authorChannelId: HB_TEST_CHANNEL_ID_NE!,
    originChannelId: HB_TEST_ORIGIN_CHANNEL_ID!,
  });
  console.timeEnd("getChat");

  expect(membership).toBeUndefined();
});
