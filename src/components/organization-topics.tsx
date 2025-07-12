"use client";

import React from "react";
import { AddTopicButton } from "@/components/add-topic-button";
import { TopicAccordion } from "@/components/topic-accordion";

interface ProjectTopicsProps {
  project: {
    id: string;
    name: string;
    slug: string;
    topics: Array<{
      id: string;
      name: string;
      description: string;
      projectId: string;
      queries: Array<{
        id: string;
        content: string;
        topicId: string;
        projectId: string;
      }>;
    }>;
  };
}

export function ProjectTopics({ project }: ProjectTopicsProps) {
  const [topics, setTopics] = React.useState(project.topics);

  const handleTopicAdded = React.useCallback(
    (newTopic: {
      id: string;
      name: string;
      description: string;
      projectId: string;
      queries: {
        id: string;
        content: string;
        topicId: string;
        projectId: string;
      }[];
    }) => {
      setTopics((prevTopics) =>
        [...prevTopics, newTopic].toSorted((a, b) =>
          a.name.localeCompare(b.name, "es-ES"),
        ),
      );
    },
    [],
  );

  const handleTopicDeleted = React.useCallback((topicId: string) => {
    setTopics((prevTopics) =>
      prevTopics
        .filter((topic) => topic.id !== topicId)
        .toSorted((a, b) => a.name.localeCompare(b.name, "es-ES")),
    );
  }, []);

  const handleTopicUpdated = React.useCallback(
    (topicId: string, newName: string) => {
      setTopics((prevTopics) =>
        prevTopics
          .map((topic) =>
            topic.id === topicId ? { ...topic, name: newName } : topic,
          )
          .toSorted((a, b) => a.name.localeCompare(b.name, "es-ES")),
      );
    },
    [],
  );

  const handleQueryAdded = React.useCallback(
    (newQuery: {
      id: string;
      content: string;
      topicId: string;
      projectId: string;
    }) => {
      setTopics((prevTopics) =>
        prevTopics.map((topic) =>
          topic.id === newQuery.topicId
            ? {
                ...topic,
                queries: [...topic.queries, newQuery].toSorted((a, b) =>
                  a.content.localeCompare(b.content, "es-ES"),
                ),
              }
            : topic,
        ),
      );
    },
    [],
  );

  const handleQueryUpdated = React.useCallback(
    (topicId: string, queryId: string, newContent: string) => {
      setTopics((prevTopics) =>
        prevTopics.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                queries: topic.queries
                  .map((query) =>
                    query.id === queryId
                      ? { ...query, content: newContent }
                      : query,
                  )
                  .toSorted((a, b) =>
                    a.content.localeCompare(b.content, "es-ES"),
                  ),
              }
            : topic,
        ),
      );
    },
    [],
  );

  const handleQueryDeleted = React.useCallback(
    (topicId: string, queryId: string) => {
      setTopics((prevTopics) =>
        prevTopics.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                queries: topic.queries
                  .filter((query) => query.id !== queryId)
                  .toSorted((a, b) =>
                    a.content.localeCompare(b.content, "es-ES"),
                  ),
              }
            : topic,
        ),
      );
    },
    [],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl tracking-tight">
          {project.name}
        </h1>
        <p className="text-muted-foreground">
          Manage topics and queries for your project
        </p>
      </div>

      {/* Add Topic Button */}
      <div className="flex justify-start">
        <AddTopicButton
          projectId={project.id}
          onTopicAdded={handleTopicAdded}
        />
      </div>

      {/* Topics Accordion */}
      {topics.length > 0 ? (
        <TopicAccordion
          topics={topics}
          onTopicDeleted={handleTopicDeleted}
          onTopicUpdated={handleTopicUpdated}
          onQueryAdded={handleQueryAdded}
          onQueryUpdated={handleQueryUpdated}
          onQueryDeleted={handleQueryDeleted}
        />
      ) : (
        <div className="py-12 text-center">
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="font-medium text-lg">No topics yet</h3>
            <p className="mx-auto max-w-sm text-muted-foreground text-sm">
              Get started by creating your first topic. Topics help organize
              queries and make them easier to manage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
