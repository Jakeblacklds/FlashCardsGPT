// database.js

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('categories.db');

// Inicializar la base de datos
const initDB = async () => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS category_images (id INTEGER PRIMARY KEY NOT NULL, categoryId INTEGER UNIQUE, uri TEXT);',
                [],
                () => {
                    resolve();
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
};

// Insertar una imagen
const insertImage = async (categoryId, uri) => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO category_images (categoryId, uri) VALUES (?, ?);',
                [categoryId, uri],
                (_, result) => {
                    resolve(result);
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
};

// Obtener la imagen de una categoría
const fetchImage = async (categoryId) => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM category_images WHERE categoryId = ?;',
                [categoryId],
                (_, result) => {
                    if (result.rows.length > 0) {
                        resolve(result.rows._array[0]);
                    } else {
                        resolve(null);
                    }
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
};

// Eliminar la imagen de una categoría
const deleteImage = async (categoryId) => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'DELETE FROM category_images WHERE categoryId = ?;',
                [categoryId],
                (_, result) => {
                    resolve(result);
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
};

const upsertImage = async (categoryId, uri) => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT OR REPLACE INTO category_images (categoryId, uri) VALUES (?, ?);',
                [categoryId, uri],
                (_, result) => {
                    resolve(result);
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
};

export { initDB, insertImage, fetchImage, deleteImage, upsertImage };