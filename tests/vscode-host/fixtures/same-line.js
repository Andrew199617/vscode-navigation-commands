const ready = true;
function outer() { function inner() {
  if (ready) {
    return 1;
  }
  return 0;
}
return inner;
}
const after = true;
