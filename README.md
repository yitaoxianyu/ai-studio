# AI Studio

A powerful AI desktop client supporting multiple LLM providers, built with Electron, React, and TypeScript.

## Features

- Multi-LLM Provider Support (OpenAI, Anthropic, Google AI, etc.)
- Custom Assistants with System Prompts
- Conversation Management
- Streaming Responses
- Markdown Rendering
- Code Syntax Highlighting
- Dark/Light Theme
- Cross-platform (Windows, macOS, Linux)

## Tech Stack

- Electron 30
- React 18
- TypeScript 5
- Redux Toolkit
- Ant Design 5
- Tailwind CSS 3
- Vite

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Build for specific platform
pnpm build:win    # Windows
pnpm build:mac    # macOS
pnpm build:linux  # Linux
```

## Project Structure

```
ai-studio/
├── src/
│   ├── main/          # Electron main process
│   ├── preload/       # Preload scripts
│   └── renderer/      # React renderer process
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── store/
│       │   ├── services/
│       │   ├── hooks/
│       │   ├── types/
│       │   └── styles/
│       └── index.html
├── build/             # Build resources
├── resources/         # App resources
└── package.json
```

## License

MIT
