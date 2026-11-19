import Toast from "react-native-toast-message";
import { errorFeedback } from "@/utils/haptics";

export const showErrorToast = (text1: string) => {
	errorFeedback();
	Toast.show({ type: "error", text1 });
};
