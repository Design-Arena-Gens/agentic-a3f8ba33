const hooks = [
  "Stop scrolling if you want to {benefit}.",
  "You won't believe how fast you can {benefit}.",
  "Do this daily to {benefit} in under 30 seconds.",
  "Here’s the {niche} hack that actually works.",
  "The truth nobody tells you about {niche}.",
];

const bodies = [
  "Step 1: {stepOne}.",
  "Next, {stepTwo} to keep momentum.",
  "Now {stepThree} so the algorithm keeps pushing you.",
];

const ctas = [
  "Follow for daily {niche} boosts.",
  "Comment “READY” if you want a custom plan.",
  "Share this with someone who needs a {niche} upgrade.",
  "Save this so you never forget the steps.",
];

type ScriptOptions = {
  niche: string;
  benefit: string;
  stepOne: string;
  stepTwo: string;
  stepThree: string;
};

const randomFrom = (items: string[]) =>
  items[Math.floor(Math.random() * items.length)];

export function generateScript(options: ScriptOptions) {
  const { niche, benefit, stepOne, stepTwo, stepThree } = options;

  const hook = randomFrom(hooks)
    .replace("{benefit}", benefit)
    .replace("{niche}", niche);

  const body = bodies
    .map((line) =>
      line
        .replace("{stepOne}", stepOne)
        .replace("{stepTwo}", stepTwo)
        .replace("{stepThree}", stepThree)
        .replace("{niche}", niche)
    )
    .join(" ");

  const cta = randomFrom(ctas).replace("{niche}", niche);

  return {
    hook,
    body,
    cta,
    script: `${hook} ${body} ${cta}`,
    niche,
  };
}

export type GeneratedScript = ReturnType<typeof generateScript>;
