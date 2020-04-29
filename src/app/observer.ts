export function observer(tag: string) {
  return {
    next(event) {
      console.log(`${tag} next`, event);
    },
    complete() {
      console.log(`${tag} destroyed`);
    },
  };
}

export function logDestroy(comp: string) {
  console.log(`${comp}: ngOnDestroy`);
}
