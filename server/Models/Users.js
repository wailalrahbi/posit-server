import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  pic: {
    type: String,
  },
});

const UserModel = mongoose.model("UserProfile", UserSchema,"UserProfile");

export default UserModel;
