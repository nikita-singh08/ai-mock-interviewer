import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/components/mockwise";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mockwise — AI Mock Interview Platform" },
      {
        name: "description",
        content:
          "Practice technical and HR interviews with AI. Get instant confidence scoring and structured feedback.",
      },
      { property: "og:title", content: "Mockwise — AI Mock Interview Platform" },
      {
        property: "og:description",
        content:
          "Practice technical and HR interviews with AI. Get instant confidence scoring and structured feedback.",
      },
    ],
  }),
  component: Dashboard,
});
