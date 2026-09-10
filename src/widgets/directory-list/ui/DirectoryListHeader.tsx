import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import {
  Button,
  DirectoryBreadcrumb,
  PageContextBar,
} from "../../../shared/ui";

export type DirectoryListHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  directoryLabel: string;
  directoryTo: string;
  createTo?: string;
  createLabel?: string;
  /** Extra CTAs next to the create link (e.g. print journal). */
  actions?: ReactNode;
};

export function DirectoryListHeader({
  title,
  description,
  directoryLabel,
  directoryTo,
  createTo,
  createLabel,
  actions,
}: DirectoryListHeaderProps) {
  const createButton =
    createTo && createLabel ? (
      <Button asChild size="sm">
        <Link to={createTo}>
          <Plus className="size-3.5" />
          {createLabel}
        </Link>
      </Button>
    ) : null;

  return (
    <PageContextBar
      sticky={false}
      eyebrow={
        <DirectoryBreadcrumb
          directoryLabel={directoryLabel}
          directoryTo={directoryTo}
        />
      }
      title={title}
      description={description}
      actions={
        actions || createButton ? (
          <>
            {actions}
            {createButton}
          </>
        ) : undefined
      }
    />
  );
}
