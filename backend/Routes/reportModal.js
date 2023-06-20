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
      igice: req.body.igice,
      costs: req.body.costs,
      real: req.body.real,
      inStock: req.body.report,
      user: req.user,
    });
    const report = await newReport.save();
    res.status(201).send({ message: "new report generated", report });
  })
);
const PAGE_SIZE = 2;

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

reportRouter.get("/search", async (req, res) => {
  try {
    const {
      ibyangiritse,
      soldAt,
      depts,
      real,
      comments,
      givenTo,
      key,
      page,
      limit,
    } = req.query;
    const skip = (page - 1) * limit;
    const search = key
      ? {
          $or: [
            { givenTo: { $regex: key, $options: "i" } },
            { comments: { $regex: key, $options: "i" } },
          ],
        }
      : {};

    const data = await Report.find(search).skip(skip).limit(limit);
    res.json({ data });
  } catch (error) {
    console.error("Error fetching report data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

reportRouter.get(
  "/given",
  expressAsyncHandler(async (req, res) => {
    const givenTo = await Report.find().distinct("givenTo");
    res.send(givenTo);
  })
);

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
      if (report.igice !== 0) {
        report.depts = report.depts - report.igice;
      } else {
        report.depts = report.depts * 0;
      }
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
      if (report.igice !== 0) {
        report.depts = report.depts - report.igice;
      } else {
        report.depts = report.depts * 0;
      }
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
