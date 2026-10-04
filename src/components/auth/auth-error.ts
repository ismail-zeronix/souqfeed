type AuthError = { code?: string; message?: string } | null | undefined;

export function getAuthErrorMessage(error: AuthError) {
  if (error?.code === "FAILED_TO_CREATE_USER") {
    return "Your account could not be created. Please try again, or contact support if this continues.";
  }
  return error?.message || "Unable to complete authentication. Please try again.";
}
