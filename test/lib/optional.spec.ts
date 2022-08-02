import { Option, None } from "@app/lib/optional";

describe("Optional", () => {
  describe("#unwrap", () => {
    it("Should unwrap with value", () => {
      const optional = Option(1);
      expect(optional.unwrap()).toEqual(1);
    });

    it("Should unwrap with undefined", () => {
      const optional = None();
      expect(optional.unwrap()).toBeUndefined();
    });
  });

  describe("#get", () => {
    it("Should get value", () => {
      const optional = Option(1);
      expect(optional.get()).toEqual(1);
    });

    it("Should throw error when value is undefined", () => {
      const optional = None();
      expect(() => optional.get()).toThrowError("Value is undefined");
    });
  });

  describe("#orElse", () => {
    it("Should get original value", () => {
      const optional = Option(1);
      expect(optional.orElse(2)).toEqual(1);
    });

    it("Should get default value", () => {
      const optional = None();
      expect(optional.orElse(1)).toEqual(1);
    });
  });

  describe("#orElseThrow", () => {
    it("Should get original value", () => {
      const optional = Option(1);
      expect(optional.orElseThrow(new Error("test"))).toEqual(1);
    });

    it("Should throw error when value is undefined", () => {
      const optional = None();
      const error = new Error("test");
      expect(() => optional.orElseThrow(error)).toThrowError("test");
    });
  });

  describe("#map", () => {
    it("Should map value", () => {
      const optional = Option(1);
      expect(optional.map((value) => value + 1)).toEqual(Option(2));
    });

    it("Should map async value", async () => {
      const optional = Option(1);
      expect(
        await optional.mapAsync((value) => Promise.resolve(value + 1)),
      ).toEqual(Option(2));
    });

    it("Should return None when value is undefined", () => {
      const optional = None<number>();
      expect(optional.map((value) => value + 1)).toEqual(None());
    });

    it("Should return None when async value is undefined", async () => {
      const optional = None<number>();
      expect(
        await optional.mapAsync((value) => Promise.resolve(value + 1)),
      ).toEqual(None());
    });
  });

  describe("#match", () => {
    it("Should match value", () => {
      const optional = Option(1);
      const result = optional.match({
        none: () => 0,
        some: (value) => value + 1,
      });
      expect(result).toEqual(2);
    });

    it("Should match async value", async () => {
      const optional = Option(1);
      const result = await optional.matchAsync({
        none: () => Promise.resolve(0),
        some: (value) => Promise.resolve(value + 1),
      });
      expect(result).toEqual(2);
    });

    it("Should return none result when is undefined", () => {
      const optional = None<number>();
      const result = optional.match({
        none: () => 0,
        some: (value) => value + 1,
      });
      expect(result).toEqual(0);
    });

    it("Should return none result async when is undefined", async () => {
      const optional = None<number>();
      const result = await optional.matchAsync({
        none: () => Promise.resolve(0),
        some: (value) => Promise.resolve(value + 1),
      });
      expect(result).toEqual(0);
    });
  });

  describe("#onSome", () => {
    it("Should call function when value is defined", () => {
      let functionCalled = false;
      const optional = Option(1);
      optional.onSome(() => {
        functionCalled = true;
      });
      expect(functionCalled).toBeTruthy();
    });

    it("Should not call function when value is undefined", () => {
      let functionCalled = false;
      const optional = None();
      optional.onSome(() => {
        functionCalled = true;
      });
      expect(functionCalled).toBeFalsy();
    });

    it("Should return value when value is defined as promise", async () => {
      let functionCalled = false;
      const optional = Option(Promise.resolve(1));
      await optional.onSomeAsync(async () => {
        functionCalled = true;
      });
      expect(functionCalled).toBeTruthy();
    });

    it("Should return value when value is undefined as promise", async () => {
      let functionCalled = false;
      const optional = None();
      await optional.onSomeAsync(async () => {
        functionCalled = true;
      });
      expect(functionCalled).toBeFalsy();
    });
  });

  describe("#isEmpty", () => {
    it("Should return true when value is undefined", () => {
      const optional = None();
      expect(optional.isEmpty()).toBeTruthy();
    });

    it("Should return false when value is defined", () => {
      const optional = Option(1);
      expect(optional.isEmpty()).toBeFalsy();
    });
  });

  describe("#isDefined", () => {
    it("Should return true when value is defined", () => {
      const optional = Option(1);
      expect(optional.isDefined()).toBeTruthy();
    });

    it("Should return false when value is undefined", () => {
      const optional = None();
      expect(optional.isDefined()).toBeFalsy();
    });
  });
});
