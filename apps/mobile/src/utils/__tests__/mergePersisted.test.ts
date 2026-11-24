import { z } from "zod";
import { mergePersisted } from "@/utils/mergePersisted";

type State = { enabled: boolean; mode: "a" | "b"; count: number };
const current: State = { enabled: true, mode: "a", count: 0 };
const merge = mergePersisted<State>({
	enabled: z.boolean(),
	mode: z.enum(["a", "b"]),
});

describe("mergePersisted", () => {
	it("restores the saved fields it can read", () => {
		expect(merge({ enabled: false, mode: "b" }, current)).toEqual({
			enabled: false,
			mode: "b",
			count: 0,
		});
	});

	it("keeps the current value of a field it cannot read, and only that one", () => {
		expect(merge({ enabled: false, mode: "z" }, current)).toEqual({
			enabled: false,
			mode: "a",
			count: 0,
		});
	});

	it("ignores fields it was not told to restore", () => {
		expect(merge({ count: 42, other: "x" }, current)).toEqual(current);
	});

	it.each([undefined, null, "oops", 3, []])(
		"starts from the current state when the saved one is %p",
		(saved) => {
			expect(merge(saved, current)).toEqual(current);
		},
	);
});
