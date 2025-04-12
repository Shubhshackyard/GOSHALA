# Contributing to GOSHALA

First off, thank you for considering contributing to GOSHALA! It's people like you that make GOSHALA such a great tool for supporting traditional cow shelters and creating a sustainable marketplace.

The following is a set of guidelines for contributing to GOSHALA. These are mostly guidelines, not rules, so use your best judgment and feel free to propose changes to this document in a pull request.

## 📋 Code of Conduct

This project and everyone participating in it is governed by the GOSHALA Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project team.

## 🤔 How Can I Contribute?

### 🐛 Reporting Bugs

This section guides you through submitting a bug report for GOSHALA. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

Before creating bug reports, please check the issue list as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title** for the issue
* **Describe the exact steps to reproduce the problem** in as much detail as possible
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem
* **Include details about your environment** (OS, browser, etc.)

### 🛠️ Pull Requests

The process described here has several goals:

- Maintain GOSHALA's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible GOSHALA
- Enable a sustainable system for GOSHALA's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in the template
2. Follow the styleguides
3. After you submit your pull request, verify that all status checks are passing

## 🔧 Development Setup

To get started with GOSHALA development:

1. Fork the repo
2. Clone your fork locally
   ```bash
   git clone https://github.com/Shubhshackyard/GOSHALA.git
   cd GOSHALA
   ```

3. Set up the development environment following the instructions in the README.md

4. Create a branch for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```

### 💻 Development Workflow

1. Make your changes
2. Run the tests to ensure everything still works
3. Commit your changes
   ```bash
   git commit -m "Your detailed commit message"
   ```
4. Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
5. Submit a pull request

## 📝 Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐛 `:bug:` when fixing a bug
    * 📝 `:memo:` when adding documentation
    * ✨ `:sparkles:` when adding a new feature

### TypeScript Styleguide

* Use 2 spaces for indentation
* Prefer camelCase for variables, properties and function names
* Use PascalCase for class and interface names
* Use UPPERCASE for constants
* Avoid any type when possible
* Add JSDoc comments for functions and classes

### React/Component Styleguide

* Prefer function components with hooks over class components
* Use descriptive names for components, props, and state variables
* Break down complex components into smaller, reusable components
* Use Material UI styling solutions (makeStyles, styled) consistently

## 🧪 Testing

* Write tests for all new features
* Ensure all tests pass before submitting a pull request
* Aim for good test coverage, especially for critical functionality

### Running Tests

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 🌐 Internationalization

* When adding new text, always use the translation system
* Add new translation keys to the appropriate locale files
* Test your changes with multiple languages when possible

## 📢 Communication

* Join our [community chat](https://matrix.to/#/#goshala:matrix.org) for real-time discussions
* Subscribe to our newsletter & follow our [blog](https://goshala.substack.com/) for important announcement & detailed articles about the project

## 🔄 Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests.

* `bug` - Indicates an unexpected problem or unintended behavior
* `documentation` - Indicates a need for improvements or additions to documentation
* `enhancement` - Indicates new feature requests
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `question` - Further information is requested

---

Thank you for investing your time in contributing to our project! Any contribution you make will be reflected in the GOSHALA platform and will help support traditional cow shelters across India.