import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      const res = await api.get(`/books/${id}`);
      setBook(res.data);
    };
    fetchBook();
  }, [id]);

  if (!book) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <img
        src={`${import.meta.env.VITE_API_URL}/${book.image}`}
        alt={book.title}
        width="200"
      />

      <h2>{book.title}</h2>
      <p><b>Author:</b> {book.author}</p>
      <p><b>Category:</b> {book.category}</p>
      <p><b>Condition:</b> {book.condition}</p>
      <p><b>Description:</b> {book.description}</p>

      <button>Request Swap</button>
    </div>
  );
};

export default BookDetails;