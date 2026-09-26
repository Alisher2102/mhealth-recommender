export const SUS_KEYS = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
  "q9",
  "q10",
] as const;

export type SusKey = (typeof SUS_KEYS)[number];

export const SUS_SCALE = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

export const SUS_ITEMS: { key: SusKey; text: string }[] = [
  { key: "q1", text: "I think that I would like to use this app frequently." },
  { key: "q2", text: "I found the app unnecessarily complex." },
  { key: "q3", text: "I thought the app was easy to use." },
  {
    key: "q4",
    text: "I think that I would need support from a technical person to be able to use this app.",
  },
  {
    key: "q5",
    text: "I found the various functions in this app were well integrated.",
  },
  {
    key: "q6",
    text: "I thought there was too much inconsistency in this app.",
  },
  {
    key: "q7",
    text: "I would imagine that most people would learn to use this app very quickly.",
  },
  { key: "q8", text: "I found the app very cumbersome to use." },
  { key: "q9", text: "I felt very confident using the app." },
  {
    key: "q10",
    text: "I needed to learn a lot of things before I could get going with this app.",
  },
];
