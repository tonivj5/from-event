export function createTokens(propertyKey: string) {
  const event = Symbol(`event ${propertyKey}`);
  const subject = Symbol(`subject ${propertyKey}`);
  const subscription = Symbol(`subscription ${propertyKey}`);

  return {
    event,
    subject,
    subscription,
  } as const;
}
