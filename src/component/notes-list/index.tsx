import axios from "axios";
import React, { useEffect, useState } from "react";
import Modal from "../modal";

interface note {
  id: number;
  title: string;
  author: string;
}

type notes = note[];

export function NoteList() {
  const [notes, setNotes] = useState<notes | null>(null);
  const [error, setError] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const fetchData = () => {
    axios
      .get("http://localhost:3002/notes-list")
      .then((response: any) => {
        const { data } = response;
        setNotes(data);
      })
      .catch(() => {
        setError(true);
      });
  };

  useEffect(() => {
    fetchData();
    return () => {};
  }, []);

  if (error) {
    return <div>Something went wrong!</div>;
  }

  if (notes === null) {
    return <div data-testid="loading-text">Loading....</div>;
  }

  return (
    <>
      <div>
        <Modal isOpen={openModel} setIsOpen={setOpenModel} title={"Add Notes"}>
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();

                axios
                  .post("http://localhost:3002/notes-list", {
                    title: title,
                    author: author,
                  })
                  .then((response: any) => {
                    setOpenModel(false);
                    fetchData();
                  })
                  .catch(() => {
                    setError(true);
                  });
              }}
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="title"
                placeholder="add title"
              />
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                data-testid="author"
                placeholder="add notes"
              />
              <div className="mt-4">
                <button
                  type="submit"
                  data-testid="save"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                >
                  Got it, thanks!
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
      {notes.length > 0 ? (
        notes.map((note, index) => (
          <li
            className="text-3xl font-bold underline bg-gray-200"
            key={index}
            data-testid="notes-list-item"
          >
            {note.title}
          </li>
        ))
      ) : (
        <div>No Noted Available</div>
      )}
      <div>
        <button onClick={() => setOpenModel(true)}>Add Notes</button>
      </div>
    </>
  );
}

export default NoteList;
