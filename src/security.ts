export interface EventSafetyOptions {
  allowPullRequestTarget?: boolean;
}

export function assertEventAllowed(eventName: string, options: EventSafetyOptions = {}): void {
  if (eventName === "pull_request_target" && !options.allowPullRequestTarget) {
    throw new Error(
      "pull_request_target is disabled by default because it can expose repository secrets to untrusted pull request content. Use pull_request when possible. If you have reviewed the risks and do not check out or execute contribution code, set allow-pull-request-target to true explicitly.",
    );
  }
}
