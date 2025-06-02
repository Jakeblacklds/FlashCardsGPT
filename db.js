// Ubicación: db.js
import * as SQLite from 'expo-sqlite';

let db;
let isDbInitialized = false;

const initDB = async () => {
  if (isDbInitialized && db) {
    return db;
  }
  try {
    console.log("Inicializando base de datos SQLite 'categories.db'...");
    db = await SQLite.openDatabaseAsync('categories.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS category_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        categoryId TEXT UNIQUE NOT NULL,
        uri TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tablas de la base de datos SQLite verificadas/creadas exitosamente.");
    isDbInitialized = true;
    return db;
  } catch (error) {
    console.error("Error inicializando la base de datos SQLite:", error);
    throw error;
  }
};

const getDb = async () => {
  if (!isDbInitialized || !db) {
    console.warn("La base de datos SQLite no estaba inicializada. Intentando inicializar ahora...");
    return await initDB();
  }
  return db;
};

const upsertImage = async (categoryId, uri) => {
  if (!categoryId || !uri) {
    const errMsg = "upsertImage: Se requieren categoryId y uri.";
    console.error(errMsg);
    throw new Error(errMsg);
  }
  const currentDb = await getDb();
  try {
    const result = await currentDb.runAsync(
      'INSERT OR REPLACE INTO category_images (categoryId, uri) VALUES (?, ?);',
      [categoryId, uri]
    );
    console.log(`Imagen insertada/actualizada para categoryId ${categoryId}. Cambios: ${result.changes}, ID de fila: ${result.lastInsertRowId}`);
    return result;
  } catch (error) {
    console.error(`Error en upsertImage para categoryId ${categoryId}:`, error);
    throw error;
  }
};

const fetchImage = async (categoryId) => {
  if (!categoryId) {
    console.warn("fetchImage: Se requiere categoryId.");
    return null;
  }
  const currentDb = await getDb();
  try {
    const imageRecord = await currentDb.getFirstAsync(
      'SELECT uri FROM category_images WHERE categoryId = ?;',
      [categoryId]
    );
    return imageRecord || null;
  } catch (error) {
    console.error(`Error en fetchImage para categoryId ${categoryId}:`, error);
    throw error;
  }
};

const deleteImage = async (categoryId) => {
  if (!categoryId) {
    console.warn("deleteImage: Se requiere categoryId.");
    return null;
  }
  const currentDb = await getDb();
  try {
    const result = await currentDb.runAsync(
      'DELETE FROM category_images WHERE categoryId = ?;',
      [categoryId]
    );
    console.log(`Imagen eliminada para categoryId ${categoryId}. Cambios: ${result.changes}`);
    return result;
  } catch (error) {
    console.error(`Error en deleteImage para categoryId ${categoryId}:`, error);
    throw error;
  }
};

const fetchCategoryByNameLocal = async (name, userId) => {
    console.warn("fetchCategoryByNameLocal (SQLite) es un placeholder.");
    return null;
};

export {
  initDB,
  fetchImage,
  deleteImage,
  upsertImage,
  getDb,
  fetchCategoryByNameLocal,
};