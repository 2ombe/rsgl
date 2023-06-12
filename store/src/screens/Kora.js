import React, { useContext, useState } from "react";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { Helmet } from "react-helmet-async";
import Button from "react-bootstrap/esm/Button";
import { Store } from "../Store";
import { useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/Checksteps";

export default function Kora() {
  const navigate = useNavigate();

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { report },
  } = state;
  const [comments, setComments] = useState("Paid");
  const [soldAt, setSoldAt] = useState(report.soldAt || 0);

  const [real, setReal] = useState(report.real || 0);
  const [depts, setDepts] = useState(report.depts || 0);
  const [ibyangiritse, setIbyangiritse] = useState(report.ibyangiritse || 0);

  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: "REPORT",
      payload: {
        soldAt,

        real,
        depts,
        ibyangiritse,
        comments,
      },
    });
    localStorage.setItem(
      "report",
      JSON.stringify({
        soldAt,

        depts,
        ibyangiritse,
        real,
        comments,
      })
    );
    navigate("/payment");
  };

  return (
    <Container>
      <Helmet>Report</Helmet>
      <h1 style={{ textAlign: "center" }}>Create report</h1>
      <CheckoutSteps step1 step2></CheckoutSteps>
      <Form
        onSubmit={submitHandler}
        className="mt-3 "
        style={{
          width: "50%",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          border: "1px solid black",
          webkitBoxShadow: "11px 13px 9px 6px rgba(0,0,0,0.89)",
          boxShadow: "11px 13px 9px 6px rgba(0,0,0,0.89)",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Add data </h1>
        <div style={{ margin: "4px", marginRight: "auto", width: "100%" }}>
          <InputGroup style={{ marginBottom: "6px" }}>
            <input
              type="number"
              name="real"
              value={real}
              onChange={(e) => setReal(e.target.value)}
              placeholder="real quantity"
            />
          </InputGroup>
          <InputGroup style={{ marginBottom: "6px" }}>
            <input
              type="number"
              name="soldAt"
              value={soldAt}
              onChange={(e) => setSoldAt(e.target.value)}
              placeholder="sold at"
            />
          </InputGroup>

          <InputGroup style={{ marginBottom: "6px" }}>
            <input
              type="number"
              value={depts}
              onChange={(e) => setDepts(e.target.value)}
              name="depts"
              placeholder="depts"
            />
          </InputGroup>
          <InputGroup style={{ marginBottom: "6px" }}>
            <input
              type="number"
              value={ibyangiritse}
              onChange={(e) => setIbyangiritse(e.target.value)}
              name="ibyangiritse"
              placeholder="ibyangiritse"
            />
          </InputGroup>

          <InputGroup>
            <textarea
              style={{ marginRight: "10px", width: "600px" }}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              name="comments"
              placeholder="comments"
            />
          </InputGroup>
          <div className="mt-3">
            <Button variant="primary" type="submit">
              Sold
            </Button>
          </div>
        </div>
      </Form>
    </Container>
  );
}
