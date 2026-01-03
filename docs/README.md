# Fleet Management System - Documentation

This folder contains comprehensive documentation for the Fleet Management System. It serves as the single source of truth for developers, AI assistants, and stakeholders working on the project.

## 📚 Core Documentation

### [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)
**Complete system architecture and business context**
- Business model and strategic vision
- System architecture and design principles
- Technology stack and infrastructure
- Core data models and modules
- API design overview
- Success metrics and ROI projections
- Security and compliance
- Future extensions roadmap

**Read this first** to understand the entire system, business goals, and technical approach.

### [BACKEND_GUIDE.md](./BACKEND_GUIDE.md)
**Comprehensive backend implementation guide**
- Layered architecture (API → Service → Repository)
- Code patterns and examples
- Dependency injection with Actix-web
- Error handling strategies
- Transaction management
- Testing strategies for each layer
- OpenAPI/Swagger documentation
- Security best practices

**Essential for** backend developers implementing or extending the Rust/Actix-web API.

### [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)
**Frontend integration and development guide**
- API client generation from OpenAPI
- State management with TanStack Query
- ID resolution patterns
- Page-by-page integration examples
- Authentication and protected routes
- Type safety with TypeScript
- Performance optimization
- Testing with MSW

**Essential for** frontend developers integrating React with the backend API.

## 🛠️ Specialized Documentation

### [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
Complete PostgreSQL schema definitions, migrations, and data models.

### [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
Comprehensive testing approach covering unit tests, integration tests, and end-to-end testing.

### [ERROR_HANDLING_AUDIT.md](./ERROR_HANDLING_AUDIT.md)
Error handling patterns, audit trail, and debugging strategies.

### [CLI_MANUAL.md](./CLI_MANUAL.md)
Command-line interface documentation for the Fleet CLI tool.

## 🎨 UI/UX Documentation

### [TEXT_COLOR_SYSTEM.md](./TEXT_COLOR_SYSTEM.md)
Design system for text colors, ensuring consistency across the application.

### [TOAST_SYSTEM_UX_GUIDE.md](./TOAST_SYSTEM_UX_GUIDE.md)
User experience guidelines for toast notifications and feedback messages.

## 📖 Documentation Philosophy

This documentation follows these principles:

1. **Single Source of Truth**: Each concept is documented in ONE place only
2. **No Redundancy**: Information is not duplicated across multiple files
3. **Clear Hierarchy**: Start with SYSTEM_OVERVIEW, then dive into specifics
4. **Code Examples**: All patterns include working code examples
5. **Living Documents**: Kept up-to-date with implementation changes

## 🚀 Quick Start

**New to the project?**
1. Read [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) for the big picture
2. Read [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) for backend development
3. Read [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) for frontend development

**Implementing a feature?**
- Backend: See relevant sections in BACKEND_GUIDE.md
- Frontend: See page-specific integration in FRONTEND_GUIDE.md
- Database: Check DATABASE_SCHEMA.md for models

**Troubleshooting?**
- Check ERROR_HANDLING_AUDIT.md for common issues
- Review TESTING_STRATEGY.md for test patterns

---

**Last Updated**: January 3, 2026  
**Maintainers**: Development Team
