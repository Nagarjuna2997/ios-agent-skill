import { useState } from 'react';
import { MemoryRouter, Routes, Route, Link, useParams } from 'react-router-dom';

function BookDetails({ books, setBooks }) {
  const { id } = useParams();
  const selected = books.find(book => book.id === id);
  return <main>
    <h1>Book details</h1>
    <p>{selected.author}</p>
    <input type="text" aria-label="Book title" value={selected.title}
      onChange={event => setBooks(books.map(book => book.id === id
        ? { ...book, title: event.target.value } : book))} />
  </main>;
}

export default function ReadingShelf() {
  const [books, setBooks] = useState([
    { id: 'cedar-a', title: 'Cedar', author: 'Lena West' },
    { id: 'cedar-b', title: 'Cedar', author: 'Jon Lake' },
  ]);
  return <MemoryRouter initialEntries={['/books']}>
    <Routes>
      <Route path="/books" element={<main>
        <h1>Reading shelf</h1>
        {books.map(book => <Link key={book.id} to={`/books/${book.id}`}>{book.title}</Link>)}
      </main>} />
      <Route path="/books/:id" element={<BookDetails books={books} setBooks={setBooks} />} />
    </Routes>
  </MemoryRouter>;
}
