# 🧪 AFRI-PLATES Testing Strategy

## 📋 **TESTING OVERVIEW**
Comprehensive testing strategy to achieve **80%+ code coverage** across all microservices with Unit, Integration, and E2E tests.

## 🎯 **TESTING PYRAMID**

### **Unit Tests (70% of total tests)**
- **Target Coverage**: 85%+
- **Focus**: Individual functions, classes, and components
- **Tools**: Jest, Supertest, React Testing Library
- **Execution**: Fast (< 5 seconds total)

### **Integration Tests (20% of total tests)**
- **Target Coverage**: Key API endpoints and database interactions
- **Focus**: Service-to-service communication
- **Tools**: Jest, Docker Test Containers, MongoDB Memory Server
- **Execution**: Medium (< 30 seconds total)

### **E2E Tests (10% of total tests)**
- **Target Coverage**: Critical user journeys
- **Focus**: Full application workflows
- **Tools**: Cypress, Playwright
- **Execution**: Slow (< 5 minutes total)

## 🔧 **TESTING SETUP**

### **Jest Configuration**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/config/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000
};
```

### **Test Database Setup**
```typescript
// tests/setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

## 📊 **SERVICE-SPECIFIC TESTING**

### **API Gateway Tests**

#### **Unit Tests**
```typescript
// tests/unit/middleware/auth.test.ts
import { authMiddleware } from '../../../src/middleware/auth';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should authenticate valid JWT token', async () => {
    const token = jwt.sign({ userId: '123' }, process.env.JWT_SECRET!);
    mockReq.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
  });

  it('should reject invalid JWT token', async () => {
    mockReq.headers = { authorization: 'Bearer invalid-token' };

    await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject missing authorization header', async () => {
    await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Authorization header required'
    });
  });
});
```

#### **Integration Tests**
```typescript
// tests/integration/api-gateway.test.ts
import request from 'supertest';
import { app } from '../../src/server';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/database';

describe('API Gateway Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        services: expect.any(Object)
      });
    });
  });

  describe('Route Proxying', () => {
    it('should proxy requests to recipe service', async () => {
      const response = await request(app)
        .get('/api/v1/recipes')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('recipes');
    });

    it('should handle service unavailable', async () => {
      // Mock service down
      const response = await request(app)
        .get('/api/v1/unavailable-service')
        .set('Authorization', 'Bearer valid-token')
        .expect(503);

      expect(response.body).toEqual({
        error: 'Service temporarily unavailable'
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(101).fill(null).map(() =>
        request(app).get('/api/v1/recipes')
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
```

### **Recipe Service Tests**

#### **Unit Tests**
```typescript
// tests/unit/services/recipe.service.test.ts
import { RecipeService } from '../../../src/services/recipe.service';
import { RecipeRepository } from '../../../src/repositories/recipe.repository';
import { CreateRecipeDto } from '../../../src/dto/recipe.dto';

jest.mock('../../../src/repositories/recipe.repository');

describe('RecipeService', () => {
  let recipeService: RecipeService;
  let mockRecipeRepository: jest.Mocked<RecipeRepository>;

  beforeEach(() => {
    mockRecipeRepository = new RecipeRepository() as jest.Mocked<RecipeRepository>;
    recipeService = new RecipeService(mockRecipeRepository);
  });

  describe('createRecipe', () => {
    it('should create a recipe successfully', async () => {
      const createRecipeDto: CreateRecipeDto = {
        name: 'Ndole',
        description: 'Traditional Cameroonian dish',
        ingredients: [
          { name: 'Groundnuts', quantity: '2 cups', unit: 'cups', isOptional: false }
        ],
        instructions: ['Step 1', 'Step 2'],
        cookingTime: 60,
        difficulty: 'Medium',
        servings: 4,
        chefId: 'chef123'
      };

      const expectedRecipe = {
        id: 'recipe123',
        ...createRecipeDto,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRecipeRepository.create.mockResolvedValue(expectedRecipe);

      const result = await recipeService.createRecipe(createRecipeDto);

      expect(result).toEqual(expectedRecipe);
      expect(mockRecipeRepository.create).toHaveBeenCalledWith(createRecipeDto);
    });

    it('should throw error for invalid recipe data', async () => {
      const invalidDto = { name: '' } as CreateRecipeDto;

      await expect(recipeService.createRecipe(invalidDto))
        .rejects.toThrow('Recipe name is required');
    });

    it('should validate ingredients', async () => {
      const dtoWithInvalidIngredients: CreateRecipeDto = {
        name: 'Test Recipe',
        ingredients: [],
        // ... other required fields
      } as CreateRecipeDto;

      await expect(recipeService.createRecipe(dtoWithInvalidIngredients))
        .rejects.toThrow('At least one ingredient is required');
    });
  });

  describe('searchRecipes', () => {
    it('should search recipes by name', async () => {
      const searchQuery = 'ndole';
      const expectedRecipes = [
        { id: '1', name: 'Ndole', description: 'Traditional dish' },
        { id: '2', name: 'Ndole Variation', description: 'Modern twist' }
      ];

      mockRecipeRepository.search.mockResolvedValue(expectedRecipes);

      const result = await recipeService.searchRecipes(searchQuery);

      expect(result).toEqual(expectedRecipes);
      expect(mockRecipeRepository.search).toHaveBeenCalledWith({
        query: searchQuery,
        filters: {}
      });
    });

    it('should filter recipes by region', async () => {
      const filters = { region: 'Centre' };
      
      mockRecipeRepository.search.mockResolvedValue([]);

      await recipeService.searchRecipes('', filters);

      expect(mockRecipeRepository.search).toHaveBeenCalledWith({
        query: '',
        filters
      });
    });
  });

  describe('getRecipeById', () => {
    it('should return recipe when found', async () => {
      const recipeId = 'recipe123';
      const expectedRecipe = { id: recipeId, name: 'Test Recipe' };

      mockRecipeRepository.findById.mockResolvedValue(expectedRecipe);

      const result = await recipeService.getRecipeById(recipeId);

      expect(result).toEqual(expectedRecipe);
    });

    it('should throw error when recipe not found', async () => {
      const recipeId = 'nonexistent';

      mockRecipeRepository.findById.mockResolvedValue(null);

      await expect(recipeService.getRecipeById(recipeId))
        .rejects.toThrow('Recipe not found');
    });
  });
});
```

#### **Integration Tests**
```typescript
// tests/integration/recipe.api.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { Recipe } from '../../src/models/recipe.model';
import { generateAuthToken } from '../helpers/auth';

describe('Recipe API Integration', () => {
  let authToken: string;
  let chefId: string;

  beforeEach(async () => {
    const authData = await generateAuthToken('chef');
    authToken = authData.token;
    chefId = authData.userId;
  });

  describe('POST /recipes', () => {
    it('should create a new recipe', async () => {
      const recipeData = {
        name: 'Jollof Rice',
        description: 'West African rice dish',
        ingredients: [
          { name: 'Rice', quantity: '2', unit: 'cups', isOptional: false },
          { name: 'Tomatoes', quantity: '4', unit: 'pieces', isOptional: false }
        ],
        instructions: [
          'Wash and parboil rice',
          'Prepare tomato sauce',
          'Combine rice and sauce'
        ],
        cookingTime: 45,
        difficulty: 'Medium',
        servings: 6,
        tags: {
          region: 'West',
          categories: ['rice', 'main-dish'],
          timeOfDay: ['lunch', 'dinner']
        }
      };

      const response = await request(app)
        .post('/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(recipeData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: recipeData.name,
        description: recipeData.description,
        chefId,
        status: 'pending'
      });

      // Verify in database
      const savedRecipe = await Recipe.findById(response.body.id);
      expect(savedRecipe).toBeTruthy();
      expect(savedRecipe!.name).toBe(recipeData.name);
    });

    it('should validate required fields', async () => {
      const invalidData = { name: '' };

      const response = await request(app)
        .post('/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContain('Recipe name is required');
    });

    it('should require authentication', async () => {
      const recipeData = { name: 'Test Recipe' };

      await request(app)
        .post('/recipes')
        .send(recipeData)
        .expect(401);
    });
  });

  describe('GET /recipes', () => {
    beforeEach(async () => {
      // Create test recipes
      await Recipe.create([
        {
          name: 'Ndole',
          description: 'Traditional Cameroonian dish',
          chefId,
          ingredients: [{ name: 'Groundnuts', quantity: '1', unit: 'cup' }],
          instructions: ['Cook groundnuts'],
          cookingTime: 60,
          difficulty: 'Hard',
          servings: 4,
          status: 'approved',
          tags: { region: 'Centre', categories: ['traditional'] }
        },
        {
          name: 'Poulet DG',
          description: 'Chicken with plantains',
          chefId,
          ingredients: [{ name: 'Chicken', quantity: '1', unit: 'whole' }],
          instructions: ['Cook chicken'],
          cookingTime: 90,
          difficulty: 'Hard',
          servings: 6,
          status: 'approved',
          tags: { region: 'Littoral', categories: ['chicken'] }
        }
      ]);
    });

    it('should return all approved recipes', async () => {
      const response = await request(app)
        .get('/recipes')
        .expect(200);

      expect(response.body.recipes).toHaveLength(2);
      expect(response.body.recipes[0]).toHaveProperty('name');
      expect(response.body.recipes[0]).toHaveProperty('description');
    });

    it('should filter recipes by region', async () => {
      const response = await request(app)
        .get('/recipes?region=Centre')
        .expect(200);

      expect(response.body.recipes).toHaveLength(1);
      expect(response.body.recipes[0].name).toBe('Ndole');
    });

    it('should search recipes by name', async () => {
      const response = await request(app)
        .get('/recipes?search=poulet')
        .expect(200);

      expect(response.body.recipes).toHaveLength(1);
      expect(response.body.recipes[0].name).toBe('Poulet DG');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/recipes?page=1&limit=1')
        .expect(200);

      expect(response.body.recipes).toHaveLength(1);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 1,
        total: 2,
        pages: 2
      });
    });
  });

  describe('GET /recipes/:id', () => {
    let recipeId: string;

    beforeEach(async () => {
      const recipe = await Recipe.create({
        name: 'Test Recipe',
        description: 'Test description',
        chefId,
        ingredients: [{ name: 'Test ingredient', quantity: '1', unit: 'cup' }],
        instructions: ['Test instruction'],
        cookingTime: 30,
        difficulty: 'Easy',
        servings: 2,
        status: 'approved'
      });
      recipeId = recipe._id.toString();
    });

    it('should return recipe by ID', async () => {
      const response = await request(app)
        .get(`/recipes/${recipeId}`)
        .expect(200);

      expect(response.body.name).toBe('Test Recipe');
      expect(response.body.id).toBe(recipeId);
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .get(`/recipes/${fakeId}`)
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/recipes/invalid-id')
        .expect(400);
    });
  });

  describe('PUT /recipes/:id', () => {
    let recipeId: string;

    beforeEach(async () => {
      const recipe = await Recipe.create({
        name: 'Original Recipe',
        description: 'Original description',
        chefId,
        ingredients: [{ name: 'Original ingredient', quantity: '1', unit: 'cup' }],
        instructions: ['Original instruction'],
        cookingTime: 30,
        difficulty: 'Easy',
        servings: 2,
        status: 'draft'
      });
      recipeId = recipe._id.toString();
    });

    it('should update recipe', async () => {
      const updateData = {
        name: 'Updated Recipe',
        description: 'Updated description',
        cookingTime: 45
      };

      const response = await request(app)
        .put(`/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Recipe');
      expect(response.body.cookingTime).toBe(45);

      // Verify in database
      const updatedRecipe = await Recipe.findById(recipeId);
      expect(updatedRecipe!.name).toBe('Updated Recipe');
    });

    it('should not allow updating other chef\'s recipe', async () => {
      const otherChefToken = (await generateAuthToken('chef')).token;

      await request(app)
        .put(`/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${otherChefToken}`)
        .send({ name: 'Hacked Recipe' })
        .expect(403);
    });
  });
});
```

### **E2E Tests**

#### **Cypress Configuration**
```javascript
// cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      apiUrl: 'http://localhost:8000/api/v1'
    }
  }
});
```

#### **E2E Test Examples**
```typescript
// cypress/e2e/recipe-management.cy.ts
describe('Recipe Management Flow', () => {
  beforeEach(() => {
    // Login as chef
    cy.login('chef@example.com', 'password123');
    cy.visit('/dashboard');
  });

  it('should create, edit, and publish a recipe', () => {
    // Navigate to create recipe
    cy.get('[data-testid="create-recipe-btn"]').click();
    cy.url().should('include', '/recipes/create');

    // Fill basic information
    cy.get('[data-testid="recipe-name"]').type('Cameroon Pepper Soup');
    cy.get('[data-testid="recipe-description"]').type('Spicy traditional soup');
    cy.get('[data-testid="cooking-time"]').type('45');
    cy.get('[data-testid="difficulty"]').select('Medium');
    cy.get('[data-testid="servings"]').type('4');

    // Add ingredients
    cy.get('[data-testid="add-ingredient-btn"]').click();
    cy.get('[data-testid="ingredient-name-0"]').type('Fish');
    cy.get('[data-testid="ingredient-quantity-0"]').type('1');
    cy.get('[data-testid="ingredient-unit-0"]').select('kg');

    cy.get('[data-testid="add-ingredient-btn"]').click();
    cy.get('[data-testid="ingredient-name-1"]').type('Pepper');
    cy.get('[data-testid="ingredient-quantity-1"]').type('2');
    cy.get('[data-testid="ingredient-unit-1"]').select('pieces');

    // Add instructions
    cy.get('[data-testid="add-instruction-btn"]').click();
    cy.get('[data-testid="instruction-0"]').type('Clean and cut fish into pieces');

    cy.get('[data-testid="add-instruction-btn"]').click();
    cy.get('[data-testid="instruction-1"]').type('Boil water and add fish');

    // Add tags
    cy.get('[data-testid="region-select"]').select('Centre');
    cy.get('[data-testid="category-fish"]').check();
    cy.get('[data-testid="time-lunch"]').check();
    cy.get('[data-testid="time-dinner"]').check();

    // Upload image
    cy.get('[data-testid="recipe-image"]').selectFile('cypress/fixtures/pepper-soup.jpg');

    // Save as draft
    cy.get('[data-testid="save-draft-btn"]').click();

    // Verify success message
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Recipe saved as draft');

    // Verify recipe appears in drafts
    cy.visit('/dashboard/recipes');
    cy.get('[data-testid="drafts-tab"]').click();
    cy.get('[data-testid="recipe-list"]')
      .should('contain', 'Cameroon Pepper Soup');

    // Edit the recipe
    cy.get('[data-testid="edit-recipe-btn"]').first().click();
    cy.get('[data-testid="recipe-description"]')
      .clear()
      .type('Delicious spicy traditional Cameroonian soup');

    // Submit for approval
    cy.get('[data-testid="submit-approval-btn"]').click();
    cy.get('[data-testid="confirm-submit-btn"]').click();

    // Verify status change
    cy.get('[data-testid="success-message"]')
      .should('contain', 'Recipe submitted for approval');

    cy.visit('/dashboard/recipes');
    cy.get('[data-testid="pending-tab"]').click();
    cy.get('[data-testid="recipe-list"]')
      .should('contain', 'Cameroon Pepper Soup');
  });

  it('should search and filter recipes', () => {
    cy.visit('/recipes');

    // Search by name
    cy.get('[data-testid="search-input"]').type('ndole');
    cy.get('[data-testid="search-btn"]').click();

    cy.get('[data-testid="recipe-cards"]')
      .should('be.visible')
      .find('[data-testid="recipe-card"]')
      .should('have.length.greaterThan', 0);

    // Filter by region
    cy.get('[data-testid="filter-region"]').select('Centre');
    cy.get('[data-testid="apply-filters-btn"]').click();

    cy.get('[data-testid="recipe-cards"]')
      .find('[data-testid="recipe-card"]')
      .each(($card) => {
        cy.wrap($card).should('contain', 'Centre');
      });

    // Filter by difficulty
    cy.get('[data-testid="filter-difficulty"]').select('Easy');
    cy.get('[data-testid="apply-filters-btn"]').click();

    cy.get('[data-testid="recipe-cards"]')
      .find('[data-testid="recipe-card"]')
      .each(($card) => {
        cy.wrap($card).find('[data-testid="difficulty-badge"]')
          .should('contain', 'Easy');
      });

    // Clear filters
    cy.get('[data-testid="clear-filters-btn"]').click();
    cy.get('[data-testid="recipe-cards"]')
      .find('[data-testid="recipe-card"]')
      .should('have.length.greaterThan', 5);
  });

  it('should view recipe details and add review', () => {
    cy.visit('/recipes');
    
    // Click on first recipe
    cy.get('[data-testid="recipe-card"]').first().click();

    // Verify recipe details page
    cy.get('[data-testid="recipe-title"]').should('be.visible');
    cy.get('[data-testid="recipe-description"]').should('be.visible');
    cy.get('[data-testid="ingredients-list"]').should('be.visible');
    cy.get('[data-testid="instructions-list"]').should('be.visible');

    // Add to favorites
    cy.get('[data-testid="favorite-btn"]').click();
    cy.get('[data-testid="favorite-btn"]')
      .should('have.class', 'favorited');

    // Scroll to reviews section
    cy.get('[data-testid="reviews-section"]').scrollIntoView();

    // Add a review
    cy.get('[data-testid="rating-stars"]')
      .find('[data-rating="5"]')
      .click();

    cy.get('[data-testid="review-comment"]')
      .type('Amazing recipe! Very authentic taste and easy to follow instructions.');

    cy.get('[data-testid="submit-review-btn"]').click();

    // Verify review appears
    cy.get('[data-testid="review-list"]')
      .should('contain', 'Amazing recipe!')
      .and('contain', '5 stars');
  });
});
```

## 📈 **COVERAGE REPORTING**

### **Coverage Scripts**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "cypress run",
    "test:all": "npm run test:coverage && npm run test:e2e",
    "coverage:report": "open coverage/lcov-report/index.html"
  }
}
```

### **Coverage Thresholds**
```javascript
// jest.config.js - Coverage thresholds per service
module.exports = {
  projects: [
    {
      displayName: 'API Gateway',
      testMatch: ['<rootDir>/backend/api-gateway/**/*.test.ts'],
      coverageThreshold: {
        global: { branches: 85, functions: 85, lines: 85, statements: 85 }
      }
    },
    {
      displayName: 'Recipe Service',
      testMatch: ['<rootDir>/backend/recipe-service/**/*.test.ts'],
      coverageThreshold: {
        global: { branches: 80, functions: 80, lines: 80, statements: 80 }
      }
    },
    {
      displayName: 'User Service',
      testMatch: ['<rootDir>/backend/user-service/**/*.test.ts'],
      coverageThreshold: {
        global: { branches: 80, functions: 80, lines: 80, statements: 80 }
      }
    }
  ]
};
```

## 🚀 **CONTINUOUS TESTING**

### **GitHub Actions Workflow**
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api-gateway, recipe-service, user-service, chef-service]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd backend/${{ matrix.service }}
        npm ci
    
    - name: Run unit tests
      run: |
        cd backend/${{ matrix.service }}
        npm run test:unit -- --coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: backend/${{ matrix.service }}/coverage/lcov.info
        flags: ${{ matrix.service }}

  integration-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        MONGODB_URI: mongodb://localhost:27017/test
        REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Start application
      run: |
        docker-compose -f docker-compose.test.yml up -d
        sleep 30
    
    - name: Run E2E tests
      uses: cypress-io/github-action@v5
      with:
        wait-on: 'http://localhost:3000'
        wait-on-timeout: 120
    
    - name: Upload E2E artifacts
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: cypress-screenshots
        path: cypress/screenshots
```

## 📊 **TESTING METRICS & REPORTING**

### **Coverage Goals by Service**
| Service | Unit Tests | Integration Tests | E2E Coverage | Total Coverage |
|---------|------------|-------------------|--------------|----------------|
| API Gateway | 90% | 80% | 70% | 85% |
| Recipe Service | 85% | 85% | 80% | 85% |
| User Service | 85% | 80% | 75% | 82% |
| Chef Service | 85% | 80% | 75% | 82% |
| Review Service | 80% | 75% | 70% | 80% |
| Media Service | 80% | 75% | 65% | 78% |
| **Overall Target** | **85%** | **80%** | **70%** | **82%** |

### **Test Execution Timeline**
- **Unit Tests**: < 30 seconds per service
- **Integration Tests**: < 2 minutes per service  
- **E2E Tests**: < 10 minutes total
- **Total Test Suite**: < 15 minutes

This comprehensive testing strategy ensures robust code quality, high coverage, and reliable deployments for the AFRI-PLATES application! 🚀 