"use client";

import { motion } from "motion/react";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/patterns/empty-state";
import { DURATION, EASE } from "@/lib/motion";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { focusFleetSearch } from "@/components/teams/fleet/fleet-toolbar";

// What the Board and the List show when a search keeps no run at all: one
// statement of the miss, what search looks at, and the way out, instead of
// an empty lane per status or a blank list. (The org chart keeps its shape
// under a search and says "No agents match" in its key.) Clearing puts the
// keyboard back in the search field, since this button leaves with the miss.

export function RunSearchEmpty() {
  const { query, setQuery } = useFleet();
  return (
    <motion.div
      className="px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
    >
      <EmptyState
        variant="plain"
        icon={IconSearch}
        title={`No runs match “${query.trim()}”`}
        description="Search looks at run titles, ids and projects, and at each agent's name and role."
        action={
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              focusFleetSearch();
            }}
          >
            Clear search
          </Button>
        }
      />
    </motion.div>
  );
}
