import express from "express";
import controller from "../controllers/gossip-controller";
import { basicTokenValidator } from "../middlewares/basik-token-validator";

const router = express.Router();

router.post("/create", basicTokenValidator, controller.createGossip);
router.get("/get/:gossipId", controller.readGossip);
router.get("/get/", basicTokenValidator, controller.readAll);
router.patch("/update/:gossipId", basicTokenValidator, controller.updateGossip);
router.delete(
  "/delete/:gossipId",
  basicTokenValidator,
  controller.deleteGossip
);

export = router;
