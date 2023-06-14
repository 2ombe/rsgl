import React, { useEffect, useReducer, useState } from "react";
import { Form, Button, ListGroup, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { getError } from "../utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, givenTo: action.payload.givenTo };
    case "FETCH_FAIL":
      return { ...state, error: action.payload };
    default: {
      return state;
    }
  }
};

function SearchForm() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const given = sp.get("givenTo") || "all";
  const query = sp.get("query") || "all";

  const [{ loading, error, givenTo }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `/api/report/search?givebTo=${given}&query=${query}`
        );
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: getError(error) });
      }
    };
    fetchData();
  }, [given, query]);

  const filterFilterUrl = (filter) => {
    const filterGiven = filter.given || given;
    const filterQuery = filter.query || query;
    return `/search?givenTo=${filterGiven}&${filterQuery}`;
  };

  return (
    <div>
      <Helmet>
        <title>Search depts</title>
      </Helmet>
      <h1>Search Depts</h1>

      <Row>
        <Col md={3}>
          {givenTo.map((c) => (
            <li key={c}>
              <Link
                className={c === givenTo ? "text-bold" : ""}
                to={filterFilterUrl({ givenTo: c })}
              >
                {c}
              </Link>
            </li>
          ))}
        </Col>
      </Row>

      <Row className="justify-content-between mb-3">
        <Col md={6}>
          <div>
            {query !== "all" && " : " + query}
            {given !== "all" && " : givenTo" + given}
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default SearchForm;
