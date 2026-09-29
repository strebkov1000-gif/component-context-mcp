export type ComponentProp = {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description: string;
};

export type ComponentDoc = {
  name: string;
  package: string;
  description: string;
  status: "stable" | "beta" | "deprecated";
  tags: string[];
  props: ComponentProp[];
  examples: Array<{ title: string; code: string }>;
  rules: string[];
};

export const componentCatalog: ComponentDoc[] = [
  {
    name: "Button",
    package: "@demo/ui",
    description: "Основное действие в интерфейсе.",
    status: "stable",
    tags: ["action", "form", "interactive"],
    props: [
      { name: "variant", type: '"primary" | "secondary" | "danger"', defaultValue: '"primary"', description: "Визуальный приоритет действия." },
      { name: "loading", type: "boolean", defaultValue: "false", description: "Показывает прогресс и блокирует повторное нажатие." },
      { name: "children", type: "React.ReactNode", required: true, description: "Текст или содержимое кнопки." }
    ],
    examples: [
      { title: "Сохранение формы", code: '<Button loading={isSaving} onClick={save}>Сохранить</Button>' }
    ],
    rules: [
      "Для главного действия на экране используйте variant=primary.",
      "Не подменяйте Button ссылкой: для навигации используйте Link."
    ]
  },
  {
    name: "Modal",
    package: "@demo/ui",
    description: "Диалог поверх текущего сценария.",
    status: "stable",
    tags: ["overlay", "dialog", "focus"],
    props: [
      { name: "open", type: "boolean", required: true, description: "Управляет видимостью диалога." },
      { name: "onClose", type: "() => void", required: true, description: "Закрывает диалог по Escape, крестику или клику вне окна." },
      { name: "title", type: "string", required: true, description: "Доступный заголовок диалога." }
    ],
    examples: [
      { title: "Подтверждение действия", code: '<Modal open={open} onClose={close} title="Удалить запись?">...</Modal>' }
    ],
    rules: [
      "Передавайте осмысленный title для скринридеров.",
      "Не открывайте модальное окно поверх другого модального окна."
    ]
  },
  {
    name: "TextField",
    package: "@demo/ui",
    description: "Однострочное текстовое поле с подписью и состоянием ошибки.",
    status: "stable",
    tags: ["form", "input", "validation"],
    props: [
      { name: "label", type: "string", required: true, description: "Видимая подпись поля." },
      { name: "value", type: "string", required: true, description: "Текущее значение." },
      { name: "error", type: "string", description: "Текст ошибки валидации." }
    ],
    examples: [
      { title: "Email", code: '<TextField label="Email" value={email} error={emailError} />' }
    ],
    rules: [
      "Не используйте placeholder вместо label.",
      "Сообщение error должно объяснять, как исправить значение."
    ]
  }
];

export function searchComponents(query: string): ComponentDoc[] {
  const terms = query.toLocaleLowerCase("ru-RU").split(/\s+/).filter(Boolean);
  if (terms.length === 0) return componentCatalog;

  return componentCatalog
    .map((component) => {
      const searchable = [
        component.name,
        component.package,
        component.description,
        ...component.tags,
        ...component.props.flatMap((prop) => [prop.name, prop.type, prop.description]),
        ...component.rules
      ].join(" ").toLocaleLowerCase("ru-RU");
      const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
      return { component, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.component.name.localeCompare(b.component.name))
    .map(({ component }) => component);
}

export function getComponent(name: string): ComponentDoc | undefined {
  return componentCatalog.find((component) => component.name.toLowerCase() === name.toLowerCase());
}

export function formatForAgent(component: ComponentDoc): string {
  const props = component.props.map((prop) => {
    const requirement = prop.required ? "required" : `optional${prop.defaultValue ? `, default ${prop.defaultValue}` : ""}`;
    return `- ${prop.name}: ${prop.type} (${requirement}) — ${prop.description}`;
  }).join("\n");
  const examples = component.examples.map((example) => `### ${example.title}\n\`\`\`tsx\n${example.code}\n\`\`\``).join("\n\n");
  const rules = component.rules.map((rule) => `- ${rule}`).join("\n");

  return `# ${component.name}\nPackage: ${component.package}\nStatus: ${component.status}\n\n${component.description}\n\n## Props\n${props}\n\n## Rules\n${rules}\n\n## Examples\n${examples}`;
}
