import { AppRouter } from "@/server/api/root";
import { TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";

export const ErrorLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      // before sending the request
      const unsubscribe = next(op).subscribe({
        error(err) {
          // handle errors
          if (err.data?.code === "INTERNAL_SERVER_ERROR") {
            console.error(err);
            return window.location.replace("/500");
          }
          if (err.data?.code === "UNAUTHORIZED") {
            return window.location.replace("/unauthorized");
          }
          observer.error(err);
        },
        next(value) {
          // handle responses if needed
          observer.next(value);
        },
      });
      return unsubscribe;
    });
  };
};
