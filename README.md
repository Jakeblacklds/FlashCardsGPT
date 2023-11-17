#FlashcardGPT


Description

This project is a mobile application developed in React Native, designed to help users learn and memorize Spanish vocabulary through flashcards. The application integrates the OpenAI API (GPT-3.5-turbo), allowing users to create categories of flashcards and enhance their learning with artificial intelligence support.
it also uses  Dall-E 3 to create images and add them in the categories. These pictures are saved in a SQLite Table

Features

Category Management: Users can add, view and delete categories.

Integration with GPT and Dall-E 3: Ability to add categories using GPT's artificial intelligence to generate relevant content.

Flashcard Personalization: Users can add, store and delete flashcards within each category.

Dark Mode: Support for dark mode, improving the user experience in different lighting conditions.

Local and Firebase Storage: Flashcard and category information is stored locally and synchronized with Firebase.


-.Technologies Used

-SQLite

-React Native

-Redux for state management

-React Navigation for navigation

-Axios for HTTP requests

-Firebase for cloud storage

-expo-image-picker for image selection

-react-native-reanimated for advanced animations



Installation
Clone the repository:

bash
Copy code

git clone [URL_REPOSITORY_URL]

Install dependencies:

bash
Copy code

npm install

Set environment variables for OpenAI and Firebase API in an .env file.

Run the application:

bash
Copy code

npm start

Using

Categories: Navigate to the categories section to create or delete categories.

Flashcards: Within each category, add new flashcards or review existing ones.

Memorization Mode: Use the memorization function to review flashcards.

Integration with GPT: In the add categories section, select the AI option to generate content with GPT.

Contribute

Contributions are welcome. To contribute, please open an issue first to discuss what you would like to change.


![Imagen de WhatsApp 2023-11-17 a las 09 02 57_4bce8be2](https://github.com/Jakeblacklds/ProyectoCasiFinal/assets/121570855/64161301-452b-4d3d-9b0b-6cdc0292f108)
![Imagen de WhatsApp 2023-11-17 a las 09 02 56_5bbd5471](https://github.com/Jakeblacklds/ProyectoCasiFinal/assets/121570855/07d8ea5c-9ff7-4206-a739-9a7e5a43cea1)
![Imagen de WhatsApp 2023-11-17 a las 09 02 56_b953a3c6](https://github.com/Jakeblacklds/ProyectoCasiFinal/assets/121570855/82cd2047-e081-4179-a82b-f5a585fc068f)
![Imagen de WhatsApp 2023-11-17 a las 09 02 57_1e5be05d](https://github.com/Jakeblacklds/ProyectoCasiFinal/assets/121570855/d277fad3-a533-4605-8ace-775fd3fb2025)
