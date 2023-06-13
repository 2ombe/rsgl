import React, { useState } from "react";
import { Form, Button, ListGroup } from "react-bootstrap";
import axios from "axios";

function SearchForm() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/search", { query });
      setSearchResults(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Search Reports</h1>
      <Form onSubmit={handleSearch}>
        <Form.Group controlId="searchQuery">
          <Form.Control
            type="text"
            placeholder="Enter search query"
            value={query}
            onChange={handleQueryChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Search
        </Button>
      </Form>

      <h2>Search Results</h2>
      {searchResults.length > 0 ? (
        <ListGroup>
          {searchResults.map((result, index) => (
            <ListGroup.Item key={index}>
              {/* Render each search result item here */}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
}

export default SearchForm;
