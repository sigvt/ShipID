import { Honeybee } from ".";

const HB_MONGO_URI = process.env.HB_MONGO_URI;
const HB_TEST_CHANNEL_ID = process.env.HB_TEST_CHANNEL_ID;
const HB_TEST_CHANNEL_ID_NE = process.env.HB_TEST_CHANNEL_ID_NE;
const HB_TEST_ORIGIN_CHANNEL_ID = process.env.HB_TEST_ORIGIN_CHANNEL_ID;

let hb!: Honeybee;

beforeAll(() => {
  console.time("hb");
  hb = new Honeybee(HB_MONGO_URI!);
  console.timeEnd("hb");
});

afterAll(async () => {
  await hb.close();
});

it("can fetch membership", async () => {
  console.time("getChat");
  const membership = await hb.getMembershipStatus(
    HB_TEST_CHANNEL_ID!,
    HB_TEST_ORIGIN_CHANNEL_ID!
  );
  console.timeEnd("getChat");

  expect(membership).toEqual(
    expect.objectContaining({
      status: expect.any(String),
    })
  );
});

it("should returns undefined", async () => {
  console.time("getChat");
  const membership = await hb.getMembershipStatus(
    HB_TEST_CHANNEL_ID_NE!,
    HB_TEST_ORIGIN_CHANNEL_ID!
  );
  console.timeEnd("getChat");

  expect(membership).toBeUndefined();
});
