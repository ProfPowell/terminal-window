# Contributing to Terminal Window

Thank you for your interest in contributing to Terminal Window! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building something together!

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/terminal-window.git
   cd terminal-window
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Running Tests

```bash
# Unit tests (watch mode)
npm test

# Unit tests (single run)
npm run test:run

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Making Changes

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Write or update tests** for your changes

4. **Run the test suite** to ensure everything passes:
   ```bash
   npm run lint && npm run test:run
   ```

5. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m "feat: add new feature description"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request** on GitHub

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for custom cursor colors
fix: resolve scroll issue on mobile devices
docs: update API documentation for print method
```

## Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line arrays/objects
- Keep lines under 100 characters
- Write descriptive variable and function names

The project uses ESLint and Prettier to enforce code style. Run `npm run format` before committing.

## Testing Guidelines

- Write tests for new features
- Update tests when modifying existing behavior
- Aim for meaningful test coverage, not just high numbers
- Use descriptive test names that explain what's being tested

## Documentation

- Update the README.md for user-facing changes
- Add JSDoc comments for new public methods
- Update CHANGELOG.md for notable changes

## Questions?

If you have questions, feel free to:
- Open a [Discussion](https://github.com/ProfPowell/terminal-window/discussions)
- Check existing [Issues](https://github.com/ProfPowell/terminal-window/issues)

Thank you for contributing!
