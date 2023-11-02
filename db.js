import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

const db = SQLite.openDatabase('flashcards.db');

export const init = () => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, imageUri TEXT);',
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

export const insertImage = (id, uri) => {
    const newUri = FileSystem.documentDirectory + uri.split('/').pop();

    return FileSystem.copyAsync({
        from: uri,
        to: newUri,
    }).then(() => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    'UPDATE categories SET imageUri = ? WHERE id = ?',
                    [newUri, id],
                    (_, result) => {
                        resolve(result);
                    },
                    (_, err) => {
                        reject(err);
                    }
                );
            });
        });
    });
};

export const fetchCategories = () => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM categories',
                [],
                (_, result) => {
                    resolve(result.rows._array);
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
};
