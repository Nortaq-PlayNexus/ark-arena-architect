import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  buildShareUrlWithConfig,
  readConfigParamFromWindow,
  stripConfigFromUrlAfterLoad,
} from "@/lib/shareConfigUrl";

describe("shareConfigUrl", () => {
  const original = window.location.href;

  afterEach(() => {
    window.history.replaceState(null, "", original);
  });

  it("reads config from search params", () => {
    window.history.replaceState(null, "", "/?config=abc%2Bdef");
    expect(readConfigParamFromWindow()).toBe("abc+def");
  });

  it("reads config from hash query", () => {
    window.history.replaceState(null, "", "/#/other?config=hello&x=1");
    expect(readConfigParamFromWindow()).toBe("hello");
  });

  it("buildShareUrlWithConfig uses query on non-file URLs", () => {
    window.history.replaceState(null, "", "/my-app");
    const url = buildShareUrlWithConfig("x+y/z=");
    expect(url).toContain("config=");
    expect(url).toContain(encodeURIComponent("x+y/z="));
    expect(url.startsWith("file:")).toBe(false);
  });

  it("stripConfigFromUrlAfterLoad removes search config and keeps hash", () => {
    window.history.replaceState(null, "", "/page?config=old#/tab");
    stripConfigFromUrlAfterLoad();
    expect(window.location.pathname).toBe("/page");
    expect(window.location.search).toBe("");
    expect(window.location.hash).toBe("#/tab");
  });

  it("stripConfigFromUrlAfterLoad removes hash config only", () => {
    window.history.replaceState(null, "", "/page#/route?config=gone&keep=1");
    stripConfigFromUrlAfterLoad();
    expect(window.location.hash).toBe("#/route?keep=1");
  });
});
