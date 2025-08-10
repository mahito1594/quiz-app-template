/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App.tsx";
import { QuizDataProvider } from "./context/QuizDataContext";
import yamlData from "./data/quiz.yaml";

// biome-ignore lint/style/noNonNullAssertion: Assume its existence
const root = document.getElementById("root")!;

render(
  () => (
    <QuizDataProvider data={yamlData}>
      <App />
    </QuizDataProvider>
  ),
  root,
);
