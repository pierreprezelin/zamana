import { useEffect, useRef } from "react";

// An answer arriving after the screen left must not change what replaced it
export const useIsMounted = () => {
	const mounted = useRef(false);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	return mounted;
};
