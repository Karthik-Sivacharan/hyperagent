import { CONTROL } from "./content";
import { Section } from "./section";

// A quiet list: four rows on hairlines, each a claim, one sentence, and
// the setting that makes it true, drawn as the product's pill.
export function Control() {
  const { section, items } = CONTROL;
  return (
    <Section copy={section}>
      <ul role="list" className="flex flex-col">
        {items.map((item) => (
          <li
            key={item.title}
            className="grid gap-3 border-t border-border-subtle py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8 md:py-7"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="max-w-xl text-base text-pretty text-muted-foreground">
                {item.body}
              </p>
            </div>
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-secondary py-1.5 pr-3 pl-3.5 text-sm shadow-edge">
              <span className="text-foreground-low">{item.setting}</span>
              <span className="font-medium text-foreground">{item.value}</span>
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
