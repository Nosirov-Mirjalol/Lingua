import type { ReactNode } from "react";
import { useAuthCheck } from "./use-auth";

interface AuthGuardProps {
	children: ReactNode;
	fallback?: ReactNode;
	check?: string;
	checkAny?: string[];
	checkAll?: string[];
	baseOn?: "role" | "permission";
}

export const AuthGuard = ({
	children,
	fallback = null,
	check,
	checkAny,
	checkAll,
	baseOn = "permission",
}: AuthGuardProps) => {
	const checkFn = useAuthCheck(baseOn);

	const hasAccess = check
		? checkFn.check(check)
		: checkAny
		? checkFn.checkAny(checkAny)
		: checkAll
		? checkFn.checkAll(checkAll)
		: true;

	return hasAccess ? children : fallback;
};