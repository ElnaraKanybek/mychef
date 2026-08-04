-- ============================================
-- DROP EXISTING TABLES (clean start)
-- ============================================
DROP TABLE IF EXISTS saved_recipes CASCADE;
DROP TABLE IF EXISTS steps CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- CREATE USERS TABLE
-- ============================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

-- ============================================
-- CREATE RECIPES TABLE
-- ============================================
CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_name VARCHAR(255) NOT NULL,
    preparation_time INTEGER NOT NULL,
    servings INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    picture_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INGREDIENTS TABLE
-- ============================================
CREATE TABLE ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

-- ============================================
-- CREATE STEPS TABLE
-- ============================================
CREATE TABLE steps (
    step_id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    description TEXT NOT NULL
);

-- ============================================
-- CREATE SAVED RECIPES TABLE
-- ============================================
CREATE TABLE saved_recipes (
    saved_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);