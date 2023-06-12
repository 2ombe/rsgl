import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth, suAdmin } from "../utils.js";
import Expense from "../models/expense.js";

const expenseRouter = express.Router();

expenseRouter.post(
  "/",

  expressAsyncHandler(async (req, res) => {
    const newReport = await Expense.create(req.body);
    const report = await newReport.save();
    res.status(201).send({ message: "new expense generated", report });
  })
);

expenseRouter.get(
  "/",
  isAuth,
  isAdmin || suAdmin,
  expressAsyncHandler(async (req, res) => {
    const report = await Expense.find();
    res.send(report);
  })
);

expenseRouter.get(
  "/:id",
  isAuth,
  isAdmin || suAdmin,
  expressAsyncHandler(async (req, res) => {
    const report = await Expense.findById(req.params.id);
    if (report) {
      res.send(report);
    } else {
      res.status(404).send({ message: "Report not found" });
    }
  })
);

export default expenseRouter;
