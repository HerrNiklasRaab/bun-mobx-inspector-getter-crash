import { makeAutoObservable } from "mobx";

class ChessRequest {
  _updatedAt = new Date();

  constructor() {
    makeAutoObservable(this);
  }
}

const req = new ChessRequest();

// Important: Pause so you can expand variables in the Inspector
debugger;

// Works normally at runtime:
console.log("runtime access ok:", req._updatedAt);

// Additional: shows that call(req) is ok, but get() without receiver crashes
const desc =
  Object.getOwnPropertyDescriptor(req, "_updatedAt") ||
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(req), "_updatedAt");

console.log("descriptor.get.call(req) ok:", desc.get.call(req));
try {
  console.log("descriptor.get() ->", desc.get());
} catch (e) {
  console.log("descriptor.get() throws:", e);
}
