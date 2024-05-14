import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { ServerApiVersion } from "mongodb";
import UserModel from "./Models/Users.js";
import PostModel from "./Models/Posts.js";
import bcrypt from "bcrypt";

let app = express();

app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  try {
    const { remail, rpassword } = req.body;
    const User = await UserModel.findOne({ email: remail });
    if (!User) {
      return res.status(500).json({ msg: "User not found.." });
    } else {
      const passwordMatch = await bcrypt.compare(rpassword, User.password);
      if (passwordMatch)
        return res.status(200).json({ User, msg: "Success.." });
      else return res.status(401).json({ msg: "Authentication Failed.." });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

app.post("/registerUser", async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const pic = req.body.pic;

    const hpassword = await bcrypt.hash(password, 10);
    const user = new UserModel({
      name: name,
      email: email,
      password: hpassword,
      pic: pic,
    });

    await user.save();
    res.send({ user: user, msg: "Added." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/savePost", async (req, res) => {
  try {
    const email = req.body.email;
    const postMsg = req.body.postMsg;

    const n_post = new PostModel({
      email: email,
      postMsg: postMsg,
    });

    await n_post.save();
    res.send({ post: n_post, msg: "Posted." });
    //res.send("Posted.");
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/updatePost", async (req, res) => {
  try {
    const cid = req.body.pid;
    const cpostMsg = req.body.postMsg;
    const post = await PostModel.findOne({ _id: cid });
    post.postMsg = cpostMsg;
    await post.save();
    res.send({ post: post, msg: "Updated." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/getPosts", async (req, res) => {
  try {
    const postsWithUser = await PostModel.aggregate([
      {
        $lookup: {
          from: "UserProfile",
          localField: "email",
          foreignField: "email",
          as: "user",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    const count = await PostModel.countDocuments({});
    res.json({ posts: postsWithUser, count: count });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.delete("/delPost/:pid", async (req, res) => {
  try {
    const postid = req.params.pid;
    await PostModel.findOneAndDelete({ _id: postid });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

var conn =
  "mongodb+srv://admin:1234@cluster0.kbo8y4l.mongodb.net/PostDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(conn);

app.listen(3002, () => {
  console.log("Server Connected..");
});
