import {
  getByText,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";

import { NoteList } from "../notes-list";

const server = setupServer();
// Describe the requests to mock.

const customSetupServer = ({
  notes = [
    { id: 1, title: "Lord of the Rings", author: "J. R. R. Tolkien" },
    { id: 2, title: "King of Hell", author: "S. B. Desai" },
  ],
} = {}) =>
  server.use(
    rest.get("http://localhost:3002/notes-list", (req, res, ctx) => {
      return res(ctx.json(notes));
    })
  );

describe("Given NodeList", () => {
  beforeAll(() => {
    // Establish requests interception layer before all tests.
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    // Clean up after all tests are done, preventing this
    // interception layer from affecting irrelevant tests.
    server.close();
  });
  beforeEach(() => {
    // IntersectionObserver isn't available in test environment
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  test("WHEN note-list component is mounted THEN noted render", async () => {
    customSetupServer();
    render(<NoteList />);

    await waitForElementToBeRemoved(() => screen.queryByTestId("loading-text"));

    const notes = screen.getAllByTestId("notes-list-item");
    const noteText = notes.map((note) => note.textContent);

    expect(noteText).toEqual(["Lord of the Rings", "King of Hell"]);
  });

  test("WHEN no notes available THEN render `no notes available` render ", async () => {
    server.use(
      rest.get("http://localhost:3002/notes-list", (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );
    render(<NoteList />);

    await waitForElementToBeRemoved(() => screen.queryByTestId("loading-text"));

    const noNotesListMessage = screen.getByText("No Noted Available");
    expect(noNotesListMessage).toBeInTheDocument();
  });

  test("WHEN api return error THEN render with error", async () => {
    server.use(
      rest.get("http://localhost:3002/notes-list", (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ messgae: "api call faild" }));
      })
    );
    render(<NoteList />);

    await waitForElementToBeRemoved(() => screen.queryByTestId("loading-text"));

    const errorMessage = screen.getByText("Something went wrong!");
    expect(errorMessage).toBeInTheDocument();
  });

  test(`Scenario: When user Click on Add New Notes THEN Open a Modal `, async () => {
    const notes = [
      { id: 1, title: "Lord of the Rings", author: "J. R. R. Tolkien" },
      { id: 2, title: "King of Hell", author: "S. B. Desai" },
    ];
    customSetupServer({ notes: notes });
    server.use(
      rest.post("http://localhost:3002/notes-list", (req, res, ctx) => {
        notes.push({
          title: "Learn MobX",
          author: "state management Library",
          id: 3,
        });
        return res(ctx.status(200));
      })
    );
    render(<NoteList />);
    await waitForElementToBeRemoved(() => screen.queryByTestId("loading-text"));
    const addNoteButton = screen.getByText("Add Notes");

    userEvent.click(addNoteButton);
    const modal = screen.getByTestId("modal");
    expect(modal).toBeInTheDocument();
    userEvent.type(screen.getByTestId("title"), "Learn MobX");
    userEvent.type(screen.getByTestId("author"), "state management Library");
    userEvent.click(screen.getByTestId("save"));

    // eslint-disable-next-line testing-library/prefer-query-by-disappearance
    await waitForElementToBeRemoved(() => screen.getByTestId("modal"));
    screen.getByText("Learn MobX");
    expect(screen.queryByTestId("modal")).toBeNull();
  });
});
