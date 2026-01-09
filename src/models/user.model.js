import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
            select: false
        }
    },
    { timestamp: true }
);
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);

});
userSchema.methods.createPassword =
    async function (candidatePassword, userPassword) {
        return await bcrypt.compare(candidatePassword, userPassword);
    }
const test = 'test'

export const User = mongoose.model("user", userSchema);
