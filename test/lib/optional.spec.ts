import { Option, None } from "@app/lib/optional";

describe("Optional", () => {
  describe("#unwrap", () => {
    it("Should unwrap with value", () => {
      const optional = Option(1);
      expect(optional.unwrap()).toEqual(1);
    });

    it("Should unwrap with undefined", () => {
      expect(None().unwrap()).toBeUndefined();
      expect(Option(null).unwrap()).toBeUndefined();
    });
  });

  describe("#get", () => {
    it("Should get value", () => {
      const optional = Option(1);
      expect(optional.get()).toEqual(1);
    });

    it("Should throw error when value is undefined", () => {
      expect(() => None().get()).toThrowError("Value is undefined");
      expect(() => Option(null).get()).toThrowError("Value is undefined");
    });
  });

  describe("#orElse", () => {
    it("Should get original value", () => {
      const optional = Option(1);
      expect(optional.orElse(2)).toEqual(1);
    });

    it("Should get default value", () => {
      expect(None().orElse(1)).toEqual(1);
      expect(Option<number>(null).orElse(1)).toEqual(1);
    });
  });

  describe("#orElseThrow", () => {
    it("Should get original value", () => {
      const optional = Option(1);
      expect(optional.orElseThrow(new Error("test"))).toEqual(1);
    });

    it("Should throw error when value is undefined", () => {
      const error = new Error("test");
      expect(() => None().orElseThrow(error)).toThrowError("test");
      expect(() => Option(null).orElseThrow(error)).toThrowError("test");
    });
  });

  describe("#map", () => {
    it("Should map value", () => {
      const optional = Option(1);
      expect(optional.map((value) => value + 1)).toEqual(Option(2));
    });

    it("Should map async value", async () => {
      const optional = Option(1);
      expect(await optional.mapAsync(async (value) => Promise.resolve(value + 1))).toEqual(
        Option(2),
      );
    });

    it("Should return None when value is undefined", () => {
      expect(None<number>().map((value) => value + 1)).toEqual(None());
      expect(Option<number>(null).map((value) => value + 1)).toEqual(None());
    });

    it("Should return None when async value is undefined", async () => {
      expect(await None<number>().mapAsync(async (value) => Promise.resolve(value + 1))).toEqual(
        None(),
      );
      expect(
        await Option<number>(null).mapAsync(async (value) => Promise.resolve(value + 1)),
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
        none: async () => Promise.resolve(0),
        some: async (value) => Promise.resolve(value + 1),
      });
      expect(result).toEqual(2);
    });

    it("Should return none result when is undefined", () => {
      const undefinedResult = None<number>().match({
        none: () => 0,
        some: (value) => value + 1,
      });
      const nullResult = Option<number>(null).match({
        none: () => 0,
        some: (value) => value + 1,
      });
      expect(undefinedResult).toEqual(0);
      expect(nullResult).toEqual(0);
    });

    it("Should return none result async when is undefined", async () => {
      const undefinedResult = await None<number>().matchAsync({
        none: async () => Promise.resolve(0),
        some: async (value) => Promise.resolve(value + 1),
      });
      const nullResult = await Option<number>(null).matchAsync({
        none: async () => Promise.resolve(0),
        some: async (value) => Promise.resolve(value + 1),
      });
      expect(undefinedResult).toEqual(0);
      expect(nullResult).toEqual(0);
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
      let undefinedFunctionCalled = false;
      let nullFunctionCalled = false;
      None().onSome(() => {
        undefinedFunctionCalled = true;
      });
      Option(null).onSome(() => {
        nullFunctionCalled = true;
      });
      expect(undefinedFunctionCalled).toBeFalsy();
      expect(nullFunctionCalled).toBeFalsy();
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
      let undefinedFunctionCalled = false;
      let nullFunctionCalled = false;
      await None().onSomeAsync(async () => {
        undefinedFunctionCalled = true;
      });
      await Option(null).onSomeAsync(async () => {
        nullFunctionCalled = true;
      });
      expect(undefinedFunctionCalled).toBeFalsy();
      expect(nullFunctionCalled).toBeFalsy();
    });
  });

  describe("#isEmpty", () => {
    it("Should return true when value is undefined", () => {
      expect(None().isEmpty()).toBeTruthy();
      expect(Option(null).isEmpty()).toBeTruthy();
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
      expect(None().isDefined()).toBeFalsy();
      expect(Option(null).isDefined()).toBeFalsy();
    });
  });
});
