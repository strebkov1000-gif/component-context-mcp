#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { componentCatalog, formatForAgent, getComponent, searchComponents } from "./catalog.js";

const server = new McpServer({
  name: "component-context-mcp",
  version: "1.0.0"
});

server.registerTool(
  "list_components",
  {
    title: "List UI components",
    description: "Returns the components available in the indexed design system."
  },
  async () => ({
    content: [{
      type: "text",
      text: componentCatalog.map(({ name, package: packageName, status, description }) =>
        `${name} (${packageName}, ${status}) — ${description}`
      ).join("\n")
    }]
  })
);

server.registerTool(
  "search_components",
  {
    title: "Search UI components",
    description: "Searches component names, tags, prop APIs and usage rules.",
    inputSchema: {
      query: z.string().min(1).describe("Natural-language query, for example: form validation")
    }
  },
  async ({ query }) => {
    const matches = searchComponents(query);
    return {
      content: [{
        type: "text",
        text: matches.length
          ? matches.map(({ name, description, tags }) => `${name} — ${description} [${tags.join(", ")}]`).join("\n")
          : `No components found for: ${query}`
      }]
    };
  }
);

server.registerTool(
  "get_component_context",
  {
    title: "Get verified component context",
    description: "Returns compact, AI-ready API documentation, rules and examples for one component.",
    inputSchema: {
      name: z.string().min(1).describe("Exact component name")
    }
  },
  async ({ name }) => {
    const component = getComponent(name);
    if (!component) {
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown component: ${name}. Use list_components or search_components first.` }]
      };
    }
    return { content: [{ type: "text", text: formatForAgent(component) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
