# MyChef

## Core Functionality

**Browsing Recipes:** Users can browse all posted recipes, sortable and filterable by category. Each recipe row shows the recipe name, creator username, and category, with a Save button to add it to the user's Saved Recipes list.

**Creating Recipes:** Users can create their own recipes with a name, optional picture link, preparation time (in minutes), servings, and category. They can also add ingredients and preparation steps directly in the creation form.

**Recipe Step & Ingredient Management:** For each recipe, users break down preparation into numbered steps and list out ingredients separately.

**Saved Recipes:** Users can save recipes created by others to their personal Saved Recipes list, which shows the recipe name, date added, and category.

**My Recipes:** Each user has a personal recipe list showing all recipes they have created, with the creation date and category displayed. From here they can create new recipes.

**Home Page / Dashboard:** After logging in, users are greeted by name and can see a trending recipes list for the week, as well as a shortcut to browse all recipes.

---

## Requirements

### Recipe Stories

- As a user, I can browse all recipes and sort or filter them by category so I can find something that fits my needs.
- As a user, I want to create a recipe by providing a name, optional picture, preparation time, servings, category, ingredients, and steps.
- As a user, I can save a recipe from the browse page so it appears in my Saved Recipes list.
- As a user, I can view my Saved Recipes list to see all recipes I have saved, sorted and filtered by category or date added.
- As a user, I can view My Recipes list to see all recipes I have personally created, sorted and filtered by category or creation date.
- As a user, I want to delete a recipe I have created if I no longer wish to share it (only recipes I created, not someone else's).
- As a user, I want to be able to remove a recipe from my Saved Recipes list if I no longer want it saved.
- As a user, I want to edit a recipe I created so I can update its details, ingredients, or steps.

### Step & Ingredient Stories

- As a user, I want to add preparation steps to my recipe so others know how to make it.
- As a user, I want to add ingredients to my recipe so others know what they need.
- As a user, I want to delete steps and ingredients in a recipe I created.

### User Management Stories

- As a user, I want to register for an account by providing my first name, username, and password so I can start using the app.
- As a user, I want to log in with my username and password to access my recipes and saved list.
- As a user, I want to log out of my account to securely end my session.
- As a user, I want to be greeted by my first name on the home page so the experience feels personalized.
- As an admin, I can view a list of all registered users and their details.
- As an admin, I can delete any user account so I can moderate the platform.
- As an admin, I can delete any recipe regardless of who created it.
- As an admin, I cannot delete my own admin account.

### Home Page Stories

- As a user, I want to see a list of trending recipes this week on my home page so I can discover popular content.
- As a user, I want a shortcut on the home page to browse all recipes so I can quickly explore the community's recipes.

---

## Entity Relationships

<img width="783" height="614" alt="Screenshot 2026-04-26 at 10 34 38 AM" src="https://github.com/user-attachments/assets/c44477a8-eedd-441f-ab2c-6785586dd815" />

- **User** — has many created Recipes, has many Saved Recipe entries; has a `role` (enum: `'user'` | `'admin'`, default: `'user'`)
- **Recipe** — belongs to a User (creator), has many Steps, has many Ingredients, belongs to a Category
- **Step** — belongs to a Recipe, has an order index
- **Ingredient** — belongs to a Recipe
- **Saved Recipe** — join table between User and Recipe

---

<img width="656" height="473" alt="logIn" src="https://github.com/user-attachments/assets/41907a51-3227-463c-ac92-866633a1f3d8" />
<img width="658" height="472" alt="signUp" src="https://github.com/user-attachments/assets/a9ef0f84-5cf8-4414-a916-69ef28ab3533" />
<img width="658" height="478" alt="homePage" src="https://github.com/user-attachments/assets/c859cf37-b0a3-4b38-8cfa-54011dee27ab" />
<img width="1461" height="1468" alt="CreateRecipe" src="https://github.com/user-attachments/assets/f3683909-96c1-48ca-ae96-67cc9234ca68" />
<img width="992" height="713" alt="getAll" src="https://github.com/user-attachments/assets/7c09c5a4-df90-419b-8687-dc2eb3a70506" />
<img width="987" height="706" alt="getAll2" src="https://github.com/user-attachments/assets/3ade220e-7893-4ae1-be5d-d327a61bc13a" />
<img width="987" height="700" alt="getAll3" src="https://github.com/user-attachments/assets/4d6922b3-5038-4812-a215-7f853f6a2ad7" />

## API Routes

### Authentication

| Request        | Action                            | Response       | Description                                            |
| -------------- | --------------------------------- | -------------- | ------------------------------------------------------ |
| GET /login     | SessionController::newSession     | 200 LoginView  | Display the login page                                 |
| POST /login    | SessionController::createSession  | 302 /home      | Log in and redirect to home; stores role in session    |
| DELETE /logout | SessionController::destroySession | 302 /login     | Log out and redirect to login                          |
| GET /signup    | UserController::newUser           | 200 SignUpView | Display the sign up page                               |
| POST /signup   | UserController::createUser        | 302 /home      | Register and redirect to home; role defaults to 'user' |

### Recipe Management

| Request                   | Action                          | Response             | Description                           |
| ------------------------- | ------------------------------- | -------------------- | ------------------------------------- |
| GET /recipes              | RecipeController::getAllRecipes | 200 RecipeListView   | Browse and filter all recipes         |
| POST /recipes             | RecipeController::createRecipe  | 201 /recipes/:id     | Create a new recipe                   |
| GET /recipes/:recipeId    | RecipeController::getRecipe     | 200 RecipeDetailView | View a specific recipe                |
| PUT /recipes/:recipeId    | RecipeController::updateRecipe  | 200 RecipeDetailView | Edit a recipe (owner only)            |
| PUT /recipes/:recipeId    | RecipeController::updateRecipe  | 403 /recipes/:id     | Forbidden if not the recipe's creator |
| DELETE /recipes/:recipeId | RecipeController::deleteRecipe  | 204 /recipes         | Delete a recipe (owner only)          |

### Step & Ingredient Management

| Request                                             | Action                                 | Response               | Description                   |
| --------------------------------------------------- | -------------------------------------- | ---------------------- | ----------------------------- |
| POST /recipes/:recipeId/steps                       | StepController::createStep             | 201 /recipes/:recipeId | Add a step to a recipe        |
| PUT /recipes/:recipeId/steps/:stepId                | StepController::updateStep             | 200 RecipeDetailView   | Edit a specific step          |
| DELETE /recipes/:recipeId/steps/:stepId             | StepController::deleteStep             | 204 /recipes/:recipeId | Delete a step                 |
| POST /recipes/:recipeId/ingredients                 | IngredientController::createIngredient | 201 /recipes/:recipeId | Add an ingredient to a recipe |
| DELETE /recipes/:recipeId/ingredients/:ingredientId | IngredientController::deleteIngredient | 204 /recipes/:recipeId | Delete an ingredient          |

### Saved Recipes

| Request                               | Action                        | Response                 | Description                         |
| ------------------------------------- | ----------------------------- | ------------------------ | ----------------------------------- |
| GET /users/:userId/saved              | SavedController::getSaved     | 200 SavedRecipesView     | View all saved recipes              |
| POST /users/:userId/saved             | SavedController::saveRecipe   | 201 /users/:userId/saved | Save a recipe to the list           |
| DELETE /users/:userId/saved/:recipeId | SavedController::unsaveRecipe | 204 /users/:userId/saved | Remove a recipe from the saved list |

### My Recipes

| Request                    | Action                             | Response          | Description                          |
| -------------------------- | ---------------------------------- | ----------------- | ------------------------------------ |
| GET /users/:userId/recipes | UserRecipeController::getMyRecipes | 200 MyRecipesView | View all recipes created by the user |

### Admin Management

| Request                         | Action                         | Response             | Description                               |
| ------------------------------- | ------------------------------ | -------------------- | ----------------------------------------- |
| GET /admin/users                | AdminController::getAllUsers   | 200 AdminUsersView   | View all registered users                 |
| DELETE /admin/users/:userId     | AdminController::deleteUser    | 204 /admin/users     | Delete a user and all their data          |
| GET /admin/recipes              | AdminController::getAllRecipes | 200 AdminRecipesView | View all recipes with management controls |
| DELETE /admin/recipes/:recipeId | AdminController::deleteRecipe  | 204 /admin/recipes   | Delete any recipe regardless of creator   |

### Middleware

| Middleware   | Checks                             | Applied To                                    |
| ------------ | ---------------------------------- | --------------------------------------------- |
| requireAuth  | session.userId exists              | All protected routes                          |
| requireOwner | resource.userId === session.userId | Edit / delete own recipes, steps, ingredients |
| requireAdmin | session.role === 'admin'           | All /admin/\* routes                          |

# Code Design

## Server

### Controller Methods:

**Admin**

- getAllUsers() ("/admin/users")
- getAllRecipesAdmin() ("/admin/recipes")
- deleteUser() ("/admin/users/:userId")
- deleteRecipeAdmin() ("/admin/recipes/:recipeId")

**All Recipes**

- createRecipe() ("/recipes")
- getAllRecipes() ("/recipes")
- getOneRecipe() ("/recipes/:recipeId")
- updateRecipe() ("/recipes/:recipeId")
- deleteRecipe() ("/recipes/:recipeId")

**Users' Recipes**

- getMyRecipes() ("/users/:userId/recipes")
- getSavedRecipes() ("/users/:userId/saved")
- addRecipeToSavedList() ("/users/:userId/saved")
- deleteRecipeFromSavedList("/users/:userId/saved/:recipeId")

**Steps and Ingredients**

- addStepToRecipe() ("/recipes/:recipeId/steps")
- updateRecipeStep() ("/recipes/:recipeId/steps/:stepId")
- deleteRecipeStep() ("/recipes/:recipeId/steps/:stepId")
- addIngredient() ("/recipes/:recipeId/ingredients")
- deleteIngredient() ("/recipes/:recipeId/ingredients")

**Type Guards**

- isValidRecipe() -> Checks if a recipe contains all the required props, and that the latter are of the valid types (typeof(recipeName) = string, typeof(prepTime) = number, etc...)
- isValidStep() -> Checks if the step is of type string
- isValidIngredient() -> Checks if the ingredient is of type string
- isOrderByValid() -> Checks if the props to order by are valid
- isSortByValid() -> Checks if the sort by is either ascending or descending

### Models:

- User.ts
- Recipe.ts
- Ingredient.ts
- RecipeStep.ts

## Client

### Components

- NavBar.tsx
- AppNavigation.tsx
- Home.tsx
- Footer.tsx
- SignUp.tsx
- Login.tsx
- CreateRecipe.tsx
- MyRecipes.tsx
- SavedRecipes.tsx
- AllRecipes.tsx
- RecipeView.tsx
