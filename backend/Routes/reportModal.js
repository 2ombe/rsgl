import express, { query } from "express";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth, suAdmin } from "../utils.js";
import Report from "../models/reportModal.js";
import User from "../models/userModal.js";
import Product from "../models/productModel.js";

const reportRouter = express.Router();
//koba
reportRouter.post(
  "/",
  isAuth,

  expressAsyncHandler(async (req, res) => {
    const newReport = await Report.create({
      reportItems: req.body.reportItems.map((x) => ({ ...x, product: x._id })),
      paymentMethod: req.body.paymentMethod,
      sales: req.body.sales,
      givenTo: req.body.givenTo,
      quantity: req.body.reportItems.quantity,
      taxPrice: req.body.taxPrice,
      grossProfit: req.body.grossProfit,
      netProfit: req.body.netProfit,
      costPrice: req.body.costPrice,
      soldAt: req.body.soldAt,
      ibyangiritse: req.body.ibyangiritse,
      comments: req.body.comments,
      depts: req.body.depts,
      costs: req.body.costs,
      real: req.body.real,
      inStock: req.body.report,
      user: req.user,
    });
    const report = await newReport.save();
    res.status(201).send({ message: "new report generated", report });
  })
);

reportRouter.get(
  "/summary",
  isAuth,

  expressAsyncHandler(async (req, res) => {
    const orders = await Report.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: "$sales" },
          totalCosts: { $sum: "$costs" },
          taxPrice: { $sum: "$taxPrice" },
          grossProfit: { $sum: "$grossProfit" },
          netProfit: { $sum: "$netProfit" },
          expense: { $sum: "$expense" },
          depts: { $sum: "$depts" },
        },
      },
    ]);

    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Report.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          sales: { $sum: "$sales" },
          grossProfit: { $sum: "$grossProfit" },
          netProfit: { $sum: "$netProfit" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const monthlyOrders = await Report.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          orders: { $sum: 1 },
          sales: { $sum: "$sales" },
          grossProfit: { $sum: "$grossProfit" },
          netProfit: { $sum: "$netProfit" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, monthlyOrders, productCategories });
  })
);

reportRouter.post("/search", async (req, res) => {
  const { query } = req.body;
  try {
    const reports = await Report.find({
      $or: [
        { comments: { $regex: query, $options: `i` } },
        { depts: query },
        { "reportItems.name": { $regex: query, $options: `i` } },
      ],
    });

    if (reports.length === 0) {
      return res.status(404).json({ message: "No report found" });
    }

    return res.json(reports);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

reportRouter.get(
  "/all",
  isAuth,

  expressAsyncHandler(async (req, res) => {
    const report = await Report.find().sort({
      createdAt: -1,
    });
    res.send(report);
  })
);

reportRouter.post(
  "/search",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const givebTo = query.givebTo || "";
    const searchQuery = query.query || "";

    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? {
            name: {
              $regex: searchQuery,
              $options: "i",
            },
          }
        : {};
    const givenToFilter = givebTo && givebTo !== "all" ? { givebTo } : {};

    const deptsFilter =
      depts && depts !== "all"
        ? {
            depts: {
              $gte: Number(depts.split("-")[0]),
              $lte: Number(depts.split("-")[1]),
            },
          }
        : {};

    const report = await Report.find({
      ...queryFilter,
      ...givenToFilter,
      ...deptsFilter,
    });

    res.send(report);
  })
);

reportRouter.put(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (report) {
    }
    if (report && report.depts && !report.soldAt) {
      report.soldAt = report.depts / report.real;
      report.paymentMethod = report.paymentMethod;
      report.comments = report.comments;
      report.sales = report.depts;
      report.depts = report.depts * 0;
      report.costs = report.costs;
      report.grossProfit = report.sales - report.costs;
      report.taxPrice = report.grossProfit * 0.18;
      report.netProfit = report.grossProfit - report.taxPrice;
      report.reportItems = req.body.reportItems.map((x) => ({
        ...x,
        product: x._id,
      }));
      const updatedReport = await report.save();
      res.send({ message: "Report updated!", report: updatedReport });
    } else if (report && report.depts && report.soldAt) {
      report.soldAt = report.soldAt;
      report.ibyangiritse = report.ibyangiritse;
      report.paymentMethod = report.paymentMethod;
      report.comments = report.comments;
      report.sales = report.depts + report.sales;
      report.depts = report.depts * 0;
      report.costs = report.costs;
      report.grossProfit = report.sales - report.costs;
      report.taxPrice = report.grossProfit * 0.18;
      report.netProfit = report.grossProfit - report.taxPrice;
      report.reportItems = req.body.reportItems.map((x) => ({
        ...x,
        product: x._id,
      }));
      const updatedReport = await report.save();
      res.send({ message: "Report updated!", report: updatedReport });
    } else {
      res.status(404).send({ message: "Report not found" });
    }
  })
);
reportRouter.get(
  "/:id",
  isAuth,

  expressAsyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (report) {
      res.send(report);
    } else {
      res.status(404).send({ message: "Report not found" });
    }
  })
);

export default reportRouter;
