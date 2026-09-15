import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { A11Y, type CaseAgent, type Department, USE_CASES } from "./content";
import { AgentAvatar } from "./glyphs";
import { Section, SURFACE } from "./section";
import styles from "./thread.module.css";
import { AgentBubble, AskCard, DoneLine, UserBubble } from "./thread-parts";

// The department tabs over one large panel: title and subtitle top-left, the
// action pill top-right, a short thread with the chosen agent in the middle,
// and the four agents of the department along the bottom, the chosen one
// lit. Both rows are real tabs (arrow keys move between them); the panel
// shell stays put and only its inside fades when a tab changes.
export function UseCases() {
  const { section, departments } = USE_CASES;
  return (
    <Section copy={section}>
      <Tabs defaultValue={departments[0].value} className="gap-5">
        <TabsList
          aria-label={A11Y.departments}
          className="max-w-full justify-start overflow-x-auto p-0.5 scrollbar-hide group-data-horizontal/tabs:h-12 sm:p-1 sm:group-data-horizontal/tabs:h-9"
        >
          {departments.map((department) => (
            <TabsTrigger
              key={department.value}
              value={department.value}
              className="flex-none px-4"
            >
              {department.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className={cn(SURFACE, "p-5 sm:p-8")}>
          {departments.map((department) => (
            <TabsContent
              key={department.value}
              value={department.value}
              className={styles.swap}
            >
              <DepartmentPanel department={department} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </Section>
  );
}

function DepartmentPanel({ department }: { department: Department }) {
  const { action } = USE_CASES;
  return (
    <Tabs defaultValue={department.agents[0].value} className="gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-medium text-foreground">
            {department.title}
          </h3>
          <p className="text-sm text-muted-foreground">{department.subtitle}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-11 md:h-8">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      </div>

      <div className="grid min-h-72 items-center md:min-h-80">
        {department.agents.map((agent) => (
          <TabsContent
            key={agent.value}
            value={agent.value}
            className={cn(
              styles.swap,
              "col-start-1 row-start-1 flex justify-center",
            )}
          >
            <CaseThread agent={agent} />
          </TabsContent>
        ))}
      </div>

      <TabsList
        variant="line"
        aria-label={A11Y.agentsIn(department.label)}
        className="grid w-full gap-x-6 gap-y-5 pt-2 group-data-horizontal/tabs:h-auto sm:grid-cols-2 lg:grid-cols-4"
      >
        {department.agents.map((agent) => (
          <TabsTrigger
            key={agent.value}
            value={agent.value}
            className="group/agent h-auto min-h-11 flex-none items-start justify-start gap-3 rounded-2xl px-1 py-1 text-left whitespace-normal after:hidden"
          >
            <AgentAvatar
              glyph={agent.glyph}
              size="lg"
              lit={false}
              fallbackClassName="group-data-[state=active]/agent:bg-tint-20 group-data-[state=active]/agent:text-foreground"
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium">{agent.name}</span>
              <span className="text-xs font-normal text-foreground-low">
                {agent.blurb}
              </span>
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

// Two or three bubbles with the chosen agent, as a picture: labelled, its
// inside inert.
function CaseThread({ agent }: { agent: CaseAgent }) {
  return (
    <div
      role="img"
      aria-label={A11Y.exampleThread(agent.name)}
      className="w-full max-w-lg"
    >
      <ol inert className="flex flex-col gap-3">
        {agent.thread.map((entry, index) => {
          switch (entry.kind) {
            case "user":
              return <UserBubble key={index}>{entry.text}</UserBubble>;
            case "agent":
              return <AgentBubble key={index}>{entry.text}</AgentBubble>;
            case "ask":
              return (
                <AskCard
                  key={index}
                  label={USE_CASES.needsYou}
                  text={entry.text}
                />
              );
            case "done":
              return <DoneLine key={index}>{entry.text}</DoneLine>;
          }
        })}
      </ol>
    </div>
  );
}
