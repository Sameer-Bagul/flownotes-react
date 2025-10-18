# Overview

This is a React-based mind mapping and flowchart application called "flowmindmap" that enables users to create, edit, and visualize AI/LLM project roadmaps. The application provides an interactive canvas where users can create hierarchical node structures (chapters, main topics, and sub-topics), connect them with customizable edges, and populate nodes with rich text content, media, and code blocks. The application integrates with multiple AI providers (LM Studio, Ollama, Google Gemini, and Grok) to automatically generate mindmaps from user-provided topics.

# Recent Changes

**October 18, 2025**: Successfully migrated project from Lovable to Replit platform
- Restructured project to follow Replit's full-stack template with `client/`, `server/`, and `shared/` directories
- Migrated routing from react-router-dom to wouter (as per Replit template requirements)
- Created Express backend server with Vite integration for development and static serving for production
- Updated all configuration files (vite.config.ts, tsconfig.json, package.json) for Replit environment
- Removed unused dependencies (react-router-dom, lovable-tagger)
- Application now runs successfully on port 5000 with hot module replacement

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Core Framework**: React with TypeScript, using Vite as the build tool and development server. The application follows a component-based architecture with functional components and React hooks for state management.

**UI Component Library**: The application uses shadcn/ui components (built on Radix UI primitives) for consistent design system implementation. Components include dialogs, popovers, buttons, cards, and form elements with Tailwind CSS for styling.

**Routing**: Implements client-side routing using Wouter, a lightweight routing library. Main routes include the flow editor (`/`), roadmaps management (`/roadmaps`), and keyboard shortcuts (`/shortcuts`).

**Flow Visualization**: Built on @xyflow/react (formerly React Flow) for creating interactive node-based diagrams. This provides the core canvas functionality including:
- Drag-and-drop node creation
- Interactive edge connections
- Minimap and controls
- Pan and zoom capabilities

**Rich Text Editing**: Integrates TipTap editor with multiple extensions for rich content editing within nodes:
- Code blocks with syntax highlighting (using lowlight)
- Tables, lists, headings
- Image embedding
- Text formatting and alignment
- Task lists and highlights

## State Management

**Flow State**: Uses Zustand for lightweight state management with two main stores:
- `flowStore.ts`: Manages flow history, undo/redo functionality, and current nodes/edges
- `settingsStore.ts`: Manages application settings like theme preferences

**React Flow State**: Leverages built-in React Flow hooks (`useNodesState`, `useEdgesState`) for managing the flow diagram state with automatic reactivity.

## Component Structure

**Node Types**: Three primary node types representing different hierarchical levels:
- Chapter nodes (yellow/amber theme)
- Main topic nodes (blue theme)
- Sub-topic nodes (green theme)

Each node type supports:
- Rich text content editing
- Media embedding (images, videos, YouTube)
- Custom styling (background/border colors)
- Resizable dimensions
- Multiple connection handles (top, right, bottom, left)

**Data Flow**: Component composition pattern with separation of concerns:
- `TextNode.tsx`: Main node wrapper component
- `NodeContent.tsx`: Handles content editing and media
- `NodeControls.tsx`: Manages node settings and deletion
- `NodeHeader.tsx`: Displays node type badge and controls
- `NoteEditor.tsx`: Rich text editor implementation

## External Dependencies

**AI Provider Integration**: The application integrates with multiple AI services for automated mindmap generation:

1. **LM Studio**: Local LLM server (default: `http://192.168.1.8:1234`)
   - Models: Deepseek R1 Distill QWen 7B, Llama 3 8B, Mistral 7B
   - API: OpenAI-compatible chat completions endpoint

2. **Ollama**: Local model runner (default: `http://localhost:11434`)
   - Models: Mistral, Llama 3 8B, Gemma 7B
   - Custom API implementation

3. **Google Gemini**: Cloud-based AI service
   - API endpoint: `https://generativelanguage.googleapis.com`
   - Models: Gemini 1.5 Pro, Gemini 1.5 Flash
   - Requires API key

4. **Grok API**: X.AI's Grok service
   - API endpoint: `https://api.grok.x`
   - Models: Grok-1
   - Requires API key

**AI Response Processing**: The `aiProviderApi.ts` utility handles:
- Provider-specific API calls
- JSON response parsing
- Error handling and validation
- Automatic node/edge generation from AI responses

**Layout Utilities**: The `layoutUtils.ts` module provides algorithms for automatic node positioning:
- Radial layout for circular arrangements
- Tree layout for hierarchical structures
- Hierarchical mindmap layout with multiple levels

## Data Persistence

**Local Storage**: Flow data can be saved to and loaded from browser localStorage, providing session persistence without backend requirements.

**Export/Import**: Users can download flows as JSON files and import previously saved flows, enabling data portability and backup.

## Backend Architecture

**Express Server**: Minimal Node.js/Express backend serving the React application:
- Development mode: Vite middleware for hot module replacement
- Production mode: Serves static built assets
- API routes placeholder in `server/routes.ts` (currently unused)

The backend is intentionally lightweight as most functionality is client-side, with AI integrations communicating directly with external services.

## Styling and Theming

**Tailwind CSS**: Utility-first CSS framework with custom configuration supporting:
- Light/dark theme modes via next-themes
- CSS custom properties for dynamic theming
- Responsive design utilities

**Theme System**: Implements HSL-based color system with CSS variables, allowing runtime theme switching between light and dark modes.

## Build and Development

**Vite Configuration**: Custom configuration handling:
- Client-side code in `client/` directory
- Path aliases for clean imports (`@/` points to `client/src/`)
- SWC for fast TypeScript compilation
- External dependencies optimization for code splitting

**TypeScript**: Strict typing disabled for flexibility (`noImplicitAny: false`) with multiple tsconfig files for different contexts (app, node, base).