export interface EventSafetyOptions {
    allowPullRequestTarget?: boolean;
}
export declare function assertEventAllowed(eventName: string, options?: EventSafetyOptions): void;
